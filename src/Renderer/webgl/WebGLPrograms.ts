import {Hash} from "../../Core/Hash";
import {Material} from "../../Core/Material";
import {ShaderMaterial} from "../../Core/Material/ShaderMaterial";
import {WebGLProgram} from "./WebGLProgram";

export class WebGLPrograms
{
    private programs: Map<number, WebGLProgram> = new Map();

    public initProgram(gl: WebGL2RenderingContext, material: Material): WebGLProgram
    {
        const properties = [];

        if (material instanceof ShaderMaterial) {
            properties.push(material.vertexShader);
            properties.push(material.fragmentShader);
        }

        const hash = Hash.create(properties.join(''));

        if (this.programs.has(hash)) {
            return this.programs.get(hash)!;
        }

        if (material instanceof ShaderMaterial) {
            const program = WebGLProgram.create(gl, material.vertexShader, material.fragmentShader);

            this.programs.set(hash, program);

            return program;
        }

        throw new Error('Cannot initialize program.');
    }
}