export class WebGLTexture
{
    public textures: Map<string, globalThis.WebGLTexture> = new Map();

    private currentTextureUnit = 0;

    public set(gl: WebGL2RenderingContext, name: string, image: HTMLImageElement)
    {
        const texture = gl.createTexture();

        if (null === texture)
        {
            throw new Error('Cannot create webgl texture.');
        }

        gl.activeTexture(gl.TEXTURE0 + this.currentTextureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        this.textures.set(name, texture);

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.currentTextureUnit++;
    }
}