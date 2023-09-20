import {Attribute} from "./Attribute";

export class Texture
{
    public textures: Map<string, {index: int, texture: WebGLTexture}> = new Map();

    private currentTextureUnit = 1;

    public set(gl: WebGL2RenderingContext, name: string, image: HTMLImageElement, filter: GLuint = gl.LINEAR, wrap: GLuint = gl.CLAMP_TO_EDGE)
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

        this.textures.set(name, {index: this.currentTextureUnit, texture: texture});

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.currentTextureUnit++;
    }

    public has(name: string) : boolean
    {
        return this.textures.has(name);
    }

    public get(name: string) : WebGLTexture
    {
        if (!this.has(name))
        {
            throw new Error(`Texture with name "${name}" doesn't exists.`)
        }

        return this.textures.get(name)!.texture;
    }
}