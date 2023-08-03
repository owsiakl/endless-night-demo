export class WebGLShader
{
    public static create(gl: WebGL2RenderingContext, type: GLenum, source: string): globalThis.WebGLShader
    {
        const shader = gl.createShader(type);

        if (null === shader) {
            throw new Error('Cannot create webgl shader.');
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        return shader;
    }
}