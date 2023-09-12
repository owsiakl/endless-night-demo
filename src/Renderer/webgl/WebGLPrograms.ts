import {Hash} from "../../Core/Hash";
import {Material} from "../../Core/Material";
import {WebGLProgram} from "./WebGLProgram";
import {WebGLShaderCache} from "./WebGLShaderCache";
import {Object3D} from "../../Core/Object3D";
import {Mesh} from "../../Core/Object/Mesh";
import {Line} from "../../Core/Object/Line";
import {SkinnedMesh} from "../../Core/Object/SkinnedMesh";
import {Light} from "../../Light/Light";
import {DirectionalLight} from "../../Light/DirectionalLight";
import {PointLight} from "../../Light/PointLight";

export class WebGLPrograms
{
    private programs: Map<number, WebGLProgram> = new Map();
    private depthPrograms: Map<number, WebGLProgram> = new Map();

    constructor(private readonly shaderCache: WebGLShaderCache)
    {
    }

    public initProgram(gl: WebGL2RenderingContext, object: Object3D, light: Light): WebGLProgram
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