import {Scene} from "../Core/Scene";
import {Line} from "../Core/Object/Line";
import {Mesh} from "../Core/Object/Mesh";
import {Programs} from "./WebGL2/Programs";
import {Texture} from "./WebGL2/Texture";
import {VertexArrays} from "./WebGL2/VertexArrays";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {ShaderCache} from "./WebGL2/ShaderCache";
import {Camera} from "../Camera/Camera";
import {mat4} from "gl-matrix";
import {CameraPosition} from "../Camera/CameraPosition";
import {Framebuffer} from "./WebGL2/Framebuffer";
import {DebugContainer} from "../Debug/DebugContainer";
import {DirectionalLight} from "../Light/DirectionalLight";
import {PointLight} from "../Light/PointLight";
import {Light} from "../Light/Light";
import {Point} from "../Core/Object/Point";
import {Assets} from "../Core/Assets";
import {WindowDecorator} from "../Core/WindowDecorator";
import {Renderer} from "../Core/Renderer";
import {ShaderMaterial} from "../Core/Material/ShaderMaterial";

export class WebGL2Renderer implements Renderer
{
    private readonly _canvas: HTMLCanvasElement;
    private readonly _gl: WebGL2RenderingContext;
    private readonly _debug: Nullable<DebugContainer>;
    private readonly _programs;
    private readonly _shaderCache;
    private readonly _vertexArrays = new VertexArrays();
    private readonly _textures = new Texture();
    private _framebuffer: Nullable<Framebuffer>;
    private _query: Nullable<WebGLQuery>;
    private readonly _queryExt: Nullable<any>;

    public constructor(windowDecorator: WindowDecorator, assets: Assets, debug: Nullable<DebugContainer>)
    {
        this._canvas = windowDecorator.find('canvas') as HTMLCanvasElement;
        this._gl = this._canvas.getContext('webgl2', {powerPreference: 'high-performance', antialias: true}) as WebGL2RenderingContext;
        this._debug = debug;
        this._shaderCache = new ShaderCache(assets);
        this._programs = new Programs(this._shaderCache);
        this._framebuffer = null;
        this._query = null;
        this._queryExt = null;

        this._canvas.width = this._canvas.offsetWidth;
        this._canvas.style.width = `${this._canvas.offsetWidth}px`
        this._canvas.height = this._canvas.offsetHeight;
        this._canvas.style.height = `${this._canvas.offsetHeight}px`;

        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.CULL_FACE);

        if (null !== this._debug)
        {
            this._queryExt = this._gl.getExtension('EXT_disjoint_timer_query_webgl2');
        }
    }

    public render(scene: Scene, camera: Camera) : void
    {
        const gl = this._gl;
        const width = this._canvas.width;
        const height = this._canvas.height;

        scene.updateMatrixWorld();

        if (null !== this._queryExt)
        {
            if (null !== this._query)
            {
                let available = gl.getQueryParameter(this._query, gl.QUERY_RESULT_AVAILABLE);
                let disjoint = gl.getParameter(this._queryExt.GPU_DISJOINT_EXT);

                if (available && !disjoint)
                {
                    const timeElapsed = gl.getQueryParameter(this._query, gl.QUERY_RESULT);
                    this._debug!.gpuTime = timeElapsed * 1e-6;
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
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1.0, 1.0);

            if (scene.light instanceof DirectionalLight)
            {
                if (null === this._framebuffer)
                {
                    this._framebuffer = Framebuffer.depth(gl);
                }

                this.renderToFramebuffer(scene, scene.light.projectionViewMatrix);
            }

            if (scene.light instanceof PointLight)
            {
                if (null === this._framebuffer)
                {
                    this._framebuffer = Framebuffer.cubeDepth(gl);
                }

                for (let i = 0; i < scene.light.faces; i++)
                {
                    this.renderToFramebuffer(scene, scene.light.getFaceProjectionViewMatrix(i), i);
                }
            }

            gl.disable(gl.POLYGON_OFFSET_FILL);
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

        if (null !== this._queryExt)
        {
            gl.endQuery(this._queryExt.TIME_ELAPSED_EXT);
        }
    }

    public renderObject(gl: WebGL2RenderingContext, object: Mesh | Line | Point, camera: Camera, light: Nullable<Light>) : void
    {
        const geometry = object.geometry;
        const material = object.material;
        const program = this._programs.fromMaterial(gl, object, material, light);

        program.useProgram();
        this._vertexArrays.bind(gl, geometry.id);

        if (geometry.updateBuffers)
        {
            for (let i = 0, length = geometry.attributes.length; i < length; i++)
            {
                const attribute = geometry.attributes[i];

                if (program.attributes.has(attribute.name))
                {
                    program.attributes.get(attribute.name).set(attribute);
                }
            }

            if (geometry.indexed)
            {
                const buffer = gl.createBuffer();

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);
            }

            geometry.updateBuffers = false;
        }

        program.uniforms.get('u_projectionView').set(camera.projectionViewMatrix);
        program.uniforms.get('u_model').set(object.worldTransform);

        if (null !== object.material.image)
        {
            if (!this._textures.has(object.material.image.src))
            {
                this._textures.set(gl, object.material.image.src, object.material.image, gl.LINEAR, object.material.imageRepeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
            }

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this._textures.get(object.material.image.src));
            program.uniforms.get('u_texture').set(1);
        }

        if (null !== object.material.normal && program.uniforms.has('u_textureNormal'))
        {
            if (!this._textures.has(object.material.normal.src))
            {
                this._textures.set(gl, object.material.normal.src, object.material.normal, gl.LINEAR, object.material.normalRepeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
            }

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this._textures.get(object.material.normal.src));
            program.uniforms.get('u_textureNormal').set(2);
        }

        if (program.uniforms.has('u_depthTexture') && this._framebuffer?.depthTexture)
        {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, this._framebuffer.depthTexture);
            program.uniforms.get('u_depthTexture').set(3);
        }

        if (program.uniforms.has('u_depthCubeMapTexture') && this._framebuffer?.depthTexture)
        {
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._framebuffer.depthTexture);
            program.uniforms.get('u_depthCubeMapTexture').set(4);
        }

        if (light && program.uniforms.has('u_lightPosition'))
        {
            program.uniforms.get('u_lightPosition').set(light.worldTranslation);
        }

        if (light instanceof PointLight)
        {
            if (program.uniforms.has('u_lightIntensity')) program.uniforms.get('u_lightIntensity').set(light.intensity);
        }

        if (light && program.uniforms.has('u_lightProjectionViewMatrix'))
        {
            program.uniforms.get('u_lightProjectionViewMatrix').set(light.projectionViewMatrix);
        }

        if (program.uniforms.has('u_cameraPosition'))
        {
            program.uniforms.get('u_cameraPosition').set(camera._position);
        }

        if (program.uniforms.has('u_normalMatrix'))
        {
            const matrix = mat4.create();
            mat4.invert(matrix, object.worldTransform);
            mat4.transpose(matrix, matrix);
            program.uniforms.get('u_normalMatrix').set(matrix)
        }

        if (object instanceof SkinnedMesh)
        {
            const textureId = `skin_${object.geometry.id}`;

            if (!this._textures.has(textureId))
            {
                this._textures.set(gl, textureId, null, gl.NEAREST, gl.CLAMP_TO_EDGE);
            }

            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, this._textures.get(textureId));
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, object.skeleton.jointCount, 0, gl.RGBA, gl.FLOAT, object.skeleton.jointMatrix);
            program.uniforms.get('u_jointTexture').set(5);
        }

        if (null !== object.material.color)
        {
            program.uniforms.get('u_color').set(object.material.color)
        }

        if (object.material instanceof ShaderMaterial)
        {
            object.material.uniforms.forEach(
                function (value: any, name: string) : void
                {
                    if (program.uniforms.has(name))
                    {
                        program.uniforms.get(name).set(value);
                    }
                }
            );
        }

        let mode = null;

        if (object instanceof Line)
        {
            mode = gl.LINES;
        }

        if (object instanceof Mesh)
        {
            mode = gl.TRIANGLES;
        }

        if (object instanceof Point)
        {
            mode = gl.POINTS;
        }

        if (null === mode)
        {
            throw new Error('Cannot get rendering mode.');
        }

        if (object.material.blending)
        {
            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        }

        if (geometry.indexed)
        {
            gl.drawElements(mode, geometry.count, gl.UNSIGNED_SHORT, 0);
        }
        else
        {
            gl.drawArrays(mode, 0, geometry.count);
        }

        if (object.material.blending)
        {
            gl.blendFunc(gl.SRC_ALPHA, gl.ZERO);
            gl.enable(gl.DEPTH_TEST);
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
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, this._framebuffer.passDirection(gl, pass), this._framebuffer.depthTexture, 0);
        }

        gl.viewport(0, 0, Framebuffer.textureSize, Framebuffer.textureSize);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        for (let i = 0, length = scene.drawables.length; i < length; i++)
        {
            const object = scene.drawables[i];

            if (!object.material.castShadow)
            {
                continue;
            }

            const geometry = object.geometry;
            const program = this._programs.depthPass(gl, object);

            program.useProgram();
            this._vertexArrays.bind(gl, geometry.id);

            if (geometry.updateBuffers)
            {
                if (geometry.indexed)
                {
                    const buffer = gl.createBuffer();

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);
                }
            }

            if (object instanceof SkinnedMesh)
            {
                const textureId = `skin_${object.geometry.id}`;

                if (!this._textures.has(textureId))
                {
                    this._textures.set(gl, textureId, null, gl.NEAREST, gl.CLAMP_TO_EDGE);
                }

                gl.activeTexture(gl.TEXTURE5);
                gl.bindTexture(gl.TEXTURE_2D, this._textures.get(textureId));
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, object.skeleton.jointCount, 0, gl.RGBA, gl.FLOAT, object.skeleton.jointMatrix);
                program.uniforms.get('u_jointTexture').set(5);
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

            if (object instanceof Point)
            {
                mode = gl.POINTS;
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

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    public get canvas() : HTMLCanvasElement
    {
        return this._canvas;
    }
}