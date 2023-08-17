import {Scene} from "../Core/Scene";
import {Line} from "../Core/Object/Line";
import {Mesh} from "../Core/Object/Mesh";
import {WebGLPrograms} from "./webgl/WebGLPrograms";
import {WebGLTexture} from "./webgl/WebGLTexture";
import {WebGLVertexArrays} from "./webgl/WebGLVertexArrays";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {Shaders} from "../Assets/Shaders";
import {WebGLShaderCache} from "./webgl/WebGLShaderCache";
import {Camera} from "../Camera/Camera";
import {mat4} from "gl-matrix";
import {CameraPosition} from "../Camera/CameraPosition";

export class WebGLRenderer
{
    private readonly programs;
    private readonly shaderCache;
    private readonly vertexArrays = new WebGLVertexArrays();
    private readonly textures = new WebGLTexture();

    public constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly gl: WebGL2RenderingContext,
        private readonly shaders: Shaders,
    ) {
        this.shaderCache = new WebGLShaderCache(shaders);
        this.programs = new WebGLPrograms(this.shaderCache);
    }

    public render(scene: Scene, camera: Camera)
    {
        const gl = this.gl;

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        const width = this.canvas.width;
        const height = this.canvas.height;

        if (null !== camera.screenPosition)
        {
            gl.enable(gl.SCISSOR_TEST);

            if (CameraPosition.TOP === camera.screenPosition)
            {
                gl.viewport(0, height / 2, width, height / 2);
                gl.scissor(0, height / 2, width, height / 2);
            }

            if (CameraPosition.BOTTOM === camera.screenPosition)
            {
                gl.viewport(0, 0, width, height / 2);
                gl.scissor(0, 0, width, height / 2);
            }
        }
        else
        {
            gl.viewport(0, 0, width, height);
        }

        gl.clearColor(0, 0, 0, 0);


        scene.updateMatrixWorld();

        const renderList: Array<Mesh | Line> = [];

        scene.traverse(object =>
        {
            if (object instanceof Mesh || object instanceof Line)
            {
                renderList.push(object);
            }
        })

        this.renderObjects(gl, renderList, camera);
    }

    public renderObjects(gl: WebGL2RenderingContext, renderList: Array<Mesh | Line>, camera: Camera)
    {
        for (let i = 0, length = renderList.length; i < length; i++)
        {
            this.renderObject(gl, renderList[i], camera);
        }
    }

    public renderObject(gl: WebGL2RenderingContext, object: Mesh | Line, camera: Camera)
    {
        const geometry = object.geometry;
        const program = this.programs.initProgram(gl, object.material, object);

        program.useProgram();
        this.vertexArrays.bind(gl, geometry.id);

        if (geometry.updateBuffers)
        {
            for (let i = 0, length = geometry.attributes.length; i < length; i++)
            {
                const attribute = geometry.attributes[i];

                if (program.attributes.has(attribute.name))
                {
                    program.attributes.get(attribute.name).set(attribute.data, gl.ARRAY_BUFFER, attribute.itemSize, attribute.normalized);
                }
            }

            if (geometry.indexed)
            {
                const buffer = gl.createBuffer();

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);
            }

            geometry.updateBuffers = false;


            if (object.material && object.material.image)
            {
                this.textures.set(gl, object);
            }
        }

        if (object.material && object.material.image)
        {
            const texture = this.textures.textures.get(object.geometry.id);

            if (undefined !== texture)
            {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }
        }

        program.uniforms.get('u_projectionView').set(camera.projectionViewMatrix);
        program.uniforms.get('u_model').set(object.model.matrix);

        if (object instanceof SkinnedMesh)
        {
            program.uniforms.get('u_jointMat').set(object.skeleton.jointMatrix)
        }

        if (null !== object.material.color)
        {
            program.uniforms.get('u_color').set(object.material.color)
        }

        if (null !== object.material.lightPosition)
        {
            program.uniforms.get('u_lightPosition').set(object.material.lightPosition)

            const matrix = mat4.create();
            mat4.invert(matrix, object.model.matrix);
            mat4.transpose(matrix, matrix);
            program.uniforms.get('u_normalMatrix').set(matrix)
        }


        let mode = null;

        if (object instanceof Line)
        {
            mode = this.gl.LINES;
        }

        if (object instanceof Mesh)
        {
            mode = this.gl.TRIANGLES;
        }

        if (null === mode)
        {
            throw new Error('Cannot get rendering mode.');
        }

        if (geometry.indexed)
        {
            gl.drawElements(mode, geometry.count, gl.UNSIGNED_SHORT, 0);
        }
        else
        {
            gl.drawArrays(mode, 0, geometry.count);
        }

        this.vertexArrays.unbind(gl);
        program.stopProgram();
    }
}