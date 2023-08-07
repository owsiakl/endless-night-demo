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

    constructor(private readonly shaderCache: WebGLShaderCache)
    {
    }

    public initProgram(gl: WebGL2RenderingContext, material: Material, object: Object3D): WebGLProgram
    {
        const properties = [];

        if (object instanceof Mesh || object instanceof Line) {
            properties.push(object.material.image ? '#define USE_TEXTURE' : '');
            properties.push(object.material.vertexColors ? '#define USE_COLOR_ATTRIBUTE' : '');
        }

        if (object instanceof SkinnedMesh) {
            properties.push(object.skeleton ? '#define USE_SKINNING' : '');
        }

        const hash = Hash.create(properties.join(''));

        if (this.programs.has(hash)) {
            return this.programs.get(hash)!;
        }

        const program = WebGLProgram.create(gl, this.shaderCache.getVertex(properties), this.shaderCache.getFragment(properties));

        this.programs.set(hash, program);

        return program;
    }
}