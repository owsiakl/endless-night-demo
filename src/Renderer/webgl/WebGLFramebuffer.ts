export class WebGLFramebuffer
{
    public static readonly textureSize = 256;

    public readonly depthTexture: WebGLTexture;
    public readonly depthFramebuffer: globalThis.WebGLFramebuffer;

    constructor(depthTexture: WebGLTexture, depthFramebuffer: globalThis.WebGLFramebuffer)
    {
        this.depthTexture = depthTexture;
        this.depthFramebuffer = depthFramebuffer;
    }

    public static depth(gl: WebGL2RenderingContext) : WebGLFramebuffer
    {
        const depthTexture = gl.createTexture();
        const depthFramebuffer = gl.createFramebuffer();

        if (null === depthTexture)
        {
            throw new Error('Cannot create framebuffer depth texture.');
        }

        if (null === depthFramebuffer)
        {
            throw new Error('Cannot create framebuffer.');
        }

        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, this.textureSize, this.textureSize, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return new this(depthTexture, depthFramebuffer);
    }

    public static cubeDepth(gl: WebGL2RenderingContext) : WebGLFramebuffer
    {
        const depthTexture = gl.createTexture();
        const depthFramebuffer = gl.createFramebuffer();

        if (null === depthTexture)
        {
            throw new Error('Cannot create framebuffer depth texture.');
        }

        if (null === depthFramebuffer)
        {
            throw new Error('Cannot create framebuffer.');
        }

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, depthTexture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        for (let i = 0; i < 6; i++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, this.textureSize, this.textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

        return new this(depthTexture, depthFramebuffer);
    }

    public passDirection(gl: WebGL2RenderingContext, pass: int)
    {
        const cameraDirections = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ];

        return cameraDirections[pass];
    }
}