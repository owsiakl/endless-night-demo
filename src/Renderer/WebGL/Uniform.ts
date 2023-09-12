export class Uniform
{
    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly name: string,
        private readonly location: WebGLUniformLocation,
        private readonly type: GLenum,
        private readonly size: number,
    ) {
    }

    public set(data: any)
    {
        switch (this.type) {
            case 35676: this.gl.uniformMatrix4fv(this.location, false, data); break;
            case 35675: this.gl.uniformMatrix3fv(this.location, false, data); break;
            case 35665: this.gl.uniform3fv(this.location, data); break;
            case 35678: this.gl.uniform1i(this.location, data); break;
            case 35680: this.gl.uniform1i(this.location, data); break;
            default: throw new Error(`Cannot set uniform value - unrecognized type "${this.type}".`);
        }
    }
}