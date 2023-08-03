export class WebGLUniform
{
    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly name: string,
        private readonly location: WebGLUniformLocation,
        private readonly type: GLenum
    ) {
    }

    public set(data: number[])
    {
        switch (this.type) {
            case 35676: this.gl.uniformMatrix4fv(this.location, false, data); break;
            case 35675: this.gl.uniformMatrix3fv(this.location, false, data); break;
            default: throw new Error(`Cannot set uniform value - unrecognized type "${this.type}".`);
        }
    }
}