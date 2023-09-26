export class Texture
{
    private readonly _textures: Map<string, WebGLTexture>;

    public constructor()
    {
        this._textures = new Map();
    }

    public set(gl: WebGL2RenderingContext, name: string, image: HTMLImageElement, filter: GLuint = gl.LINEAR, wrap: GLuint = gl.CLAMP_TO_EDGE) : void
    {
        const texture = gl.createTexture();

        if (null === texture)
        {
            throw new Error('Cannot create webgl texture.');
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        gl.generateMipmap(gl.TEXTURE_2D);

        this._textures.set(name, texture);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    public has(name: string) : boolean
    {
        return this._textures.has(name);
    }

    public get(name: string) : WebGLTexture
    {
        if (!this.has(name))
        {
            throw new Error(`Texture with name "${name}" doesn't exists.`)
        }

        return this._textures.get(name)!;
    }
}