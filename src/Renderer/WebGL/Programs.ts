import {Hash} from "../../Core/Hash";
import {Program} from "./Program";
import {ShaderCache} from "./ShaderCache";
import {Object3D} from "../../Core/Object3D";
import {Mesh} from "../../Core/Object/Mesh";
import {Line} from "../../Core/Object/Line";
import {SkinnedMesh} from "../../Core/Object/SkinnedMesh";
import {Light} from "../../Light/Light";
import {DirectionalLight} from "../../Light/DirectionalLight";
import {PointLight} from "../../Light/PointLight";

export class Programs
{
    private readonly _shaderCache: ShaderCache;
    private readonly _programs: Map<number, Program>;
    private readonly _depthPrograms: Map<number, Program>;
    private readonly _particlePrograms: Map<number, Program>;

    public constructor(shaderCache: ShaderCache)
    {
        this._shaderCache = shaderCache;
        this._programs = new Map();
        this._depthPrograms = new Map();
        this._particlePrograms = new Map();
    }

    public initProgram(gl: WebGL2RenderingContext, object: Object3D, light: Light) : Program
    {
        let properties = [];

        if (object instanceof Mesh || object instanceof Line)
        {
            properties.push(object.material.image ? '#define USE_TEXTURE' : '');
            properties.push(object.material.vertexColors ? '#define USE_COLOR_ATTRIBUTE' : '');
            properties.push(object.material.color ? '#define USE_STATIC_COLOR_ATTRIBUTE' : '');
            properties.push(object.material.normal ? '#define USE_NORMAL_MAPPING' : '');
            properties.push(light instanceof DirectionalLight ? '#define USE_LIGHT_DIRECTIONAL' : '');
            properties.push(light instanceof PointLight ? '#define USE_LIGHT_POINT' : '');
            properties.push((light instanceof DirectionalLight || light instanceof PointLight) ? '#define USE_LIGHT' : '');
        }

        if (object instanceof SkinnedMesh)
        {
            properties.push('#define USE_SKINNING');
        }

        const hash = Hash.create(properties.join(''));

        if (this._programs.has(hash))
        {
            return this._programs.get(hash)!;
        }

        const program = Program.create(gl, this._shaderCache.getVertex(properties), this._shaderCache.getFragment(properties));

        this._programs.set(hash, program);

        return program;
    }

    public depthProgram(gl: WebGL2RenderingContext, object: Object3D) : Program
    {
        let properties = [];

        if (object instanceof SkinnedMesh)
        {
            properties.push('#define USE_SKINNING');
        }

        const hash = Hash.create(properties.join(''));

        if (this._depthPrograms.has(hash))
        {
            return this._depthPrograms.get(hash)!;
        }

        const program = Program.create(gl, this._shaderCache.getDepthVertex(properties), this._shaderCache.getDepthFragment(properties));

        this._depthPrograms.set(hash, program);

        return program;
    }

    public particleProgram(gl: WebGL2RenderingContext, pass: int, feedbackVaryings: Array<string> = []) : Program
    {
        if (this._particlePrograms.has(pass))
        {
            return this._particlePrograms.get(pass)!;
        }

        const program = Program.create(gl, this._shaderCache.getParticleVertex(pass), this._shaderCache.getParticleFragment(pass), feedbackVaryings);

        this._particlePrograms.set(pass, program);

        return program;
    }
}