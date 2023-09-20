import {Hash} from "../../Core/Hash";
import {Material} from "../../Core/Material";
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
    private programs: Map<number, Program> = new Map();
    private depthPrograms: Map<number, Program> = new Map();
    private particlePrograms: Map<number, Program> = new Map();

    constructor(private readonly shaderCache: ShaderCache)
    {
    }

    public initProgram(gl: WebGL2RenderingContext, object: Object3D, light: Light): Program
    {
        let properties = [];

        if (object instanceof Mesh || object instanceof Line) {
            properties.push(object.material.image ? '#define USE_TEXTURE' : '');
            properties.push(object.material.vertexColors ? '#define USE_COLOR_ATTRIBUTE' : '');
            properties.push(object.material.color ? '#define USE_STATIC_COLOR_ATTRIBUTE' : '');
            properties.push(light instanceof DirectionalLight ? '#define USE_LIGHT_DIRECTIONAL' : '');
            properties.push(light instanceof PointLight ? '#define USE_LIGHT_POINT' : '');
            properties.push((light instanceof DirectionalLight || light instanceof PointLight) ? '#define USE_LIGHT' : '');
        }

        if (object instanceof SkinnedMesh) {
            properties.push('#define USE_SKINNING');
        }

        const hash = Hash.create(properties.join(''));

        if (this.programs.has(hash)) {
            return this.programs.get(hash)!;
        }

        const program = Program.create(gl, this.shaderCache.getVertex(properties), this.shaderCache.getFragment(properties));

        this.programs.set(hash, program);

        return program;
    }

    public depthProgram(gl: WebGL2RenderingContext, material: Material, object: Object3D): Program
    {
        let properties = [];


        if (object instanceof SkinnedMesh) {
            properties.push('#define USE_SKINNING');
        }

        const hash = Hash.create(properties.join(''));

        if (this.depthPrograms.has(hash)) {
            return this.depthPrograms.get(hash)!;
        }

        const program = Program.create(gl, this.shaderCache.getDepthVertex(properties), this.shaderCache.getDepthFragment(properties));

        this.depthPrograms.set(hash, program);

        return program;
    }

    public particleProgram(gl: WebGL2RenderingContext, pass: int, feedbackVaryings: Array<string> = []) : Program
    {
        if (this.particlePrograms.has(pass)) {
            return this.particlePrograms.get(pass)!;
        }

        const program = Program.create(gl, this.shaderCache.getParticleVertex(pass), this.shaderCache.getParticleFragment(pass), feedbackVaryings);

        this.particlePrograms.set(pass, program);

        return program;
    }
}