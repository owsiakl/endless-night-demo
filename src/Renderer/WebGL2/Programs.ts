import {Hash} from "../../Core/Hash";
import {Program} from "./Program";
import {ShaderCache} from "./ShaderCache";
import {Object3D} from "../../Core/Object3D";
import {SkinnedMesh} from "../../Core/Object/SkinnedMesh";
import {Light} from "../../Light/Light";
import {DirectionalLight} from "../../Light/DirectionalLight";
import {PointLight} from "../../Light/PointLight";
import {ShaderMaterial} from "../../Core/Material/ShaderMaterial";
import {Material} from "../../Core/Material/Material";

export class Programs
{
    private readonly _shaderCache: ShaderCache;
    private readonly _programs: Map<number, Program>;
    private readonly _depthPrograms: Map<number, Program>;

    public constructor(shaderCache: ShaderCache)
    {
        this._shaderCache = shaderCache;
        this._programs = new Map();
        this._depthPrograms = new Map();
    }

    public fromMaterial(gl: WebGL2RenderingContext, object: Object3D, material: Material, light: Nullable<Light>) : Program
    {
        if (material instanceof ShaderMaterial)
        {
            return this.fromShader(gl, material.vertex, material.fragment);
        }

        const defines = [];

        defines.push(material.image ? '#define USE_TEXTURE' : '');
        defines.push(material.vertexColors ? '#define USE_COLOR_ATTRIBUTE' : '');
        defines.push(material.color ? '#define USE_STATIC_COLOR_ATTRIBUTE' : '');
        defines.push(material.normal ? '#define USE_NORMAL_MAPPING' : '');
        defines.push(light instanceof DirectionalLight ? '#define USE_LIGHT_DIRECTIONAL' : '');
        defines.push(light instanceof PointLight ? '#define USE_LIGHT_POINT' : '');
        defines.push((light instanceof DirectionalLight || light instanceof PointLight) ? '#define USE_LIGHT' : '');

        if (object instanceof SkinnedMesh)
        {
            defines.push('#define USE_SKINNING');
        }

        const hash = Hash.create(defines.join(''));

        if (this._programs.has(hash))
        {
            return this._programs.get(hash)!;
        }

        const program = Program.create(gl, this._shaderCache.getVertex(defines), this._shaderCache.getFragment(defines));

        this._programs.set(hash, program);

        return program;
    }

    public fromShader(gl: WebGL2RenderingContext, vShader: string, fShader: string) : Program
    {
        const hash = Hash.create(vShader + fShader);

        if (this._programs.has(hash))
        {
            return this._programs.get(hash)!;
        }

        const program = Program.create(gl, vShader, fShader);

        this._programs.set(hash, program);

        return program;
    }

    public depthPass(gl: WebGL2RenderingContext, object: Object3D) : Program
    {
        let defines = [];

        if (object instanceof SkinnedMesh)
        {
            defines.push('#define USE_SKINNING');
        }

        const hash = Hash.create(defines.join(''));

        if (this._depthPrograms.has(hash))
        {
            return this._depthPrograms.get(hash)!;
        }

        const program = Program.create(gl, this._shaderCache.getDepthVertex(defines), this._shaderCache.getDepthFragment(defines));

        this._depthPrograms.set(hash, program);

        return program;
    }
}