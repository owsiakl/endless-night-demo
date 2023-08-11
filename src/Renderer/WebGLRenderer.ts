import {Camera} from "../Engine/Camera";
import {Scene} from "../Core/Scene";
import {Line} from "../Core/Object/Line";
import {Mesh} from "../Core/Object/Mesh";
import {WebGLPrograms} from "./webgl/WebGLPrograms";
import {WebGLTexture} from "./webgl/WebGLTexture";
import {WebGLVertexArrays} from "./webgl/WebGLVertexArrays";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {Shaders} from "../Assets/Shaders";
import {WebGLShaderCache} from "./webgl/WebGLShaderCache";

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

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

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

        program.uniforms.get('u_projection').set(camera.projectionMatrix);
        program.uniforms.get('u_model').set(object.model.matrix);
        program.uniforms.get('u_view').set(camera.viewMatrix);

        if (object instanceof SkinnedMesh)
        {
            program.uniforms.get('u_jointMat').set(object.skeleton.jointMatrix)
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