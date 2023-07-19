export class Shaders
{
    #shaders = new Map();

    /**
     * @param {string} name
     * @returns Shader
     */
    get(name)
    {
        return this.#shaders.get(name);
    }

    /**
     * @param {string} name
     * @param {Shader} shader
     */
    addShader(name, shader)
    {
        this.#shaders.set(name, shader);
    }
}