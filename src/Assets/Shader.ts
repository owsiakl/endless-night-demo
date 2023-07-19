import {ShaderType} from "./ShaderType";

export class Shader
{
    public textContent: string;
    public type: ShaderType;

    public constructor(content: string, type: ShaderType)
    {
        this.textContent = content;
        this.type = type;
    }
}