import {ShaderType} from "./ShaderType";

export class Shader
{
    textContent;
    type;

    /**
     * @param {string} content
     * @param {string} type
     */
    constructor(content, type)
    {
        this.textContent = content;
        this.type = type;
    }

    /**
     * @param {string} content
     * @return Shader
     */
    static vertex(content)
    {
        return new this(content, ShaderType.VERTEX);
    }

    /**
     * @param {string} content
     * @return Shader
     */
    static fragment(content)
    {
        return new this(content, ShaderType.FRAGMENT);
    }
}