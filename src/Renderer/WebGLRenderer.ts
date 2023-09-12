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
import {mat4, vec3} from "gl-matrix";
import {CameraPosition} from "../Camera/CameraPosition";
import {WebGLFramebuffer} from "./webgl/WebGLFramebuffer";
import {DebugContainer} from "../Debug/DebugContainer";
import {DirectionalLight} from "../Light/DirectionalLight";
import {PointLight} from "../Light/PointLight";
import {Light} from "../Light/Light";

export class WebGLRenderer
{
    private readonly _gl: WebGL2RenderingContext;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _shaders: Shaders;
    private readonly _debug: Nullable<DebugContainer>;
    private readonly _programs;
    private readonly _shaderCache;
    private readonly _vertexArrays = new WebGLVertexArrays();
    private readonly _textures = new WebGLTexture();
    private _framebuffer: Nullable<WebGLFramebuffer>;
    private _query: Nullable<WebGLQuery>;
    private _queryExt: Nullable<any>;

    public constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, shaders: Shaders, debug: Nullable<DebugContainer>)
    {
        this._gl = gl;
        this._canvas = canvas;
        this._shaders = shaders;
        this._debug = debug;
        this._shaderCache = new WebGLShaderCache(shaders);
        this._programs = new WebGLPrograms(this._shaderCache);
        this._framebuffer = null;
        this._query = null;

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        if (null !== this._debug)
        {
            this._queryExt = gl.getExtension('EXT_disjoint_timer_query_webgl2');
        }
    }

    public render(scene: Scene, camera: Camera, lightPosition: vec3)
    {
        const gl = this._gl;
        const width = this._canvas.width;
        const height = this._canvas.height;

        scene.updateMatrixWorld();

        if (null !== this._debug)
        {
            if (null !== this._query)
            {
                let available = gl.getQueryParameter(this._query, gl.QUERY_RESULT_AVAILABLE);
                let disjoint = gl.getParameter(this._queryExt.GPU_DISJOINT_EXT);

                if (available && !disjoint)
                {
                    const timeElapsed = gl.getQueryParameter(this._query, gl.QUERY_RESULT);

                    this._debug.gpuTime = timeElapsed * 1e-6;
                }
            }
            else
            {
                this._query = gl.createQuery() as WebGLQuery;
            }

            gl.beginQuery(this._queryExt.TIME_ELAPSED_EXT, this._query);
        }

        if (null !== scene.light)
        {
            if (scene.light instanceof DirectionalLight)
            {
                if (null === this._framebuffer) {
                    this._framebuffer = WebGLFramebuffer.depth(gl);
                }

                this.renderToFramebuffer(scene, scene.light.projectionViewMatrix);
            }

            if (scene.light instanceof PointLight)
            {
                if (null === this._framebuffer) {
                    this._framebuffer = WebGLFramebuffer.cubeDepth(gl);
                }

                for (let i = 0; i < scene.light.faces; i++)
                {
                    this.renderToFramebuffer(scene, scene.light.getFaceProjectionViewMatrix(i), i);
                }
            }
        }

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

            if (CameraPosition.LEFT === camera.screenPosition)
            {
                gl.viewport(0, 0, width / 2, height);
                gl.scissor(0, 0, width / 2, height);
            }

            if (CameraPosition.RIGHT === camera.screenPosition)
            {
                gl.viewport(width / 2, 0, width / 2, height);
                gl.scissor(width / 2, 0, width / 2, height);
            }
        }
        else
        {
            gl.viewport(0, 0, width, height);
        }

        for (let i = 0, length = scene.drawables.length; i < length; i++)
        {
            this.renderObject(gl, scene.drawables[i], camera, scene.light);
        }

        if (null !== camera.screenPosition)
        {
            gl.disable(gl.SCISSOR_TEST);
        }

        if (null !== this._debug)
        {
            gl.endQuery(this._queryExt.TIME_ELAPSED_EXT);
        }
    }

    public renderObject(gl: WebGL2RenderingContext, object: Mesh | Line, camera: Camera, light: Light)
    {
        const geometry = object.geometry;
        const program = this._programs.initProgram(gl, object, light);

        program.useProgram();
        this._vertexArrays.bind(gl, geometry.id);

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
                this._textures.set(gl, object.material.image.src, object.material.image);
            }
        }

        program.uniforms.get('u_projectionView').set(camera.projectionViewMatrix);
        program.uniforms.get('u_model').set(object.worldTransform);

        if (null !== object.material.image)
        {
            const texture = this._textures.textures.get(object.material.image.src);

            if (undefined !== texture)
            {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                program.uniforms.get('u_texture').set(0);
            }
        }

        if (program.uniforms.has('u_depthTexture') && this._framebuffer?.depthTexture)
        {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this._framebuffer.depthTexture);
            program.uniforms.get('u_depthTexture').set(1);
        }

        if (program.uniforms.has('u_depthCubeMapTexture'))
        {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._framebuffer!.depthTexture);
            program.uniforms.get('u_depthCubeMapTexture').set(2);
        }

        if (program.uniforms.has('u_lightPosition'))
        {
            program.uniforms.get('u_lightPosition').set(light.translation);
        }

        if (program.uniforms.has('u_lightProjectionViewMatrix'))
        {
            program.uniforms.get('u_lightProjectionViewMatrix').set(light.projectionViewMatrix);
        }

        if (object instanceof SkinnedMesh)
        {
            program.uniforms.get('u_jointMat').set(object.skeleton.jointMatrix)
        }

        if (null !== object.material.color)
        {
            program.uniforms.get('u_color').set(object.material.color)
        }

        let mode = null;

        if (object instanceof Line)
        {
            mode = this._gl.LINES;
        }

        if (object instanceof Mesh)
        {
            mode = this._gl.TRIANGLES;
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

        this._vertexArrays.unbind(gl);
        program.stopProgram();
    }

    public renderToFramebuffer(scene: Scene, lightProjectionViewMatrix: mat4, pass: Nullable<int> = null) : void
    {
        if (null === this._framebuffer)
        {
            throw new Error('Framebuffer should be initialized before rendering to framebuffer.');
        }

        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer.depthFramebuffer);

        if (null !== pass)
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this._framebuffer.passDirection(gl, pass), this._framebuffer.depthTexture, 0);
        }

        gl.viewport(0, 0, WebGLFramebuffer.textureSize, WebGLFramebuffer.textureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let i = 0, length = scene.drawables.length; i < length; i++)
        {
            const object = scene.drawables[i];

            if (!object.material.castShadow)
            {
                continue;
            }

            const geometry = object.geometry;
            const program = this._programs.depthProgram(gl, object.material, object);

            program.useProgram();

            if (object instanceof SkinnedMesh)
            {
                program.uniforms.get('u_jointMat').set(object.skeleton.jointMatrix)
            }

            program.uniforms.get('u_model').set(object.worldTransform);
            program.uniforms.get('u_lightSpace').set(lightProjectionViewMatrix);

            let mode = null;

            if (object instanceof Line)
            {
                mode = gl.LINES;
            }

            if (object instanceof Mesh)
            {
                mode = gl.TRIANGLES;
            }

            if (null === mode)
            {
                throw new Error('Cannot get rendering mode.');
            }

            this._vertexArrays.bind(gl, geometry.id);

            if (geometry.indexed)
            {
                gl.drawElements(mode, geometry.count, gl.UNSIGNED_SHORT, 0);
            }
            else
            {
                gl.drawArrays(mode, 0, geometry.count);
            }

            this._vertexArrays.unbind(gl);
            program.stopProgram();
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}