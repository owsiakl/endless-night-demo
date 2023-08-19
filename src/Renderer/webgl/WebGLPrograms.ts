import {Hash} from "../../Core/Hash";
import {Material} from "../../Core/Material";
import {WebGLProgram} from "./WebGLProgram";
import {WebGLShaderCache} from "./WebGLShaderCache";
import {Object3D} from "../../Core/Object3D";
import {Mesh} from "../../Core/Object/Mesh";
import {Line} from "../../Core/Object/Line";
import {SkinnedMesh} from "../../Core/Object/SkinnedMesh";

export class WebGLPrograms
{
    private programs: Map<number, WebGLProgram> = new Map();
    private depthPrograms: Map<number, WebGLProgram> = new Map();

    constructor(private readonly shaderCache: WebGLShaderCache)
    {
    }

    public initProgram(gl: WebGL2RenderingContext, material: Material, object: Object3D): WebGLProgram
    {
        let properties = [];

        if (object instanceof Mesh || object instanceof Line) {
            properties.push(object.material.image ? '#define USE_TEXTURE' : '');
            properties.push(object.material.texture ? '#define USE_TEXTURE' : '');
            properties.push(object.material.vertexColors ? '#define USE_COLOR_ATTRIBUTE' : '');
            properties.push(object.material.color ? '#define USE_STATIC_COLOR_ATTRIBUTE' : '');
            properties.push(object.material.light ? '#define USE_LIGHT' : '');
            properties.push(object.material.shadow ? '#define USE_SHADOWING' : '');
        }

        if (object instanceof SkinnedMesh) {
            properties.push('#define USE_SKINNING');
        }

        if (material.depthMap)
        {
            properties = ['#define DEPTH_MAP'];
            properties.push(material.texture ? '#define USE_TEXTURE' : '');
        }

        const hash = Hash.create(properties.join(''));

        if (this.programs.has(hash)) {
            return this.programs.get(hash)!;
        }

        const program = WebGLProgram.create(gl, this.shaderCache.getVertex(properties), this.shaderCache.getFragment(properties));

        this.programs.set(hash, program);

        return program;
    }

    public depthProgram(gl: WebGL2RenderingContext, material: Material, object: Object3D): WebGLProgram
    {
        let properties = [];


        if (object instanceof SkinnedMesh) {
            properties.push('#define USE_SKINNING');
        }

        const hash = Hash.create(properties.join(''));

        if (this.depthPrograms.has(hash)) {
            return this.depthPrograms.get(hash)!;
        }

        const program = WebGLProgram.create(gl, this.shaderCache.getDepthVertex(properties), this.shaderCache.getDepthFragment(properties));

        this.depthPrograms.set(hash, program);

        return program;
    }
}