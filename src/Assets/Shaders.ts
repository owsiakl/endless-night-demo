import {Shader} from "./Shader";

export class Shaders
{
    private shaders: Map<string, Shader> = new Map();

    public get(name: string) : Shader
    {
        if (!this.shaders.has(name)) {
            throw new Error(`Shader "${name}" not found.`);
        }

        return this.shaders.get(name)!;
    }

    public addShader(name: string, shader: Shader) : void
    {
        if (this.shaders.has(name)) {
            throw new Error(`Shader "${name}" was already added.`);
        }

        this.shaders.set(name, shader);
    }
}