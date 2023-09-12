export class Attribute
{
    private buffer: WebGLBuffer | null = null;

    constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly name: string,
        private readonly location: GLuint
    ) {
    }

    public set(data: ArrayBufferView, target: GLenum, itemSize: number, normalized: boolean)
    {
        const gl = this.gl;
        this.buffer = gl.createBuffer();

        if (null === this.buffer) {
            throw new Error('Cannot create webgl buffer.');
        }

        const type = (() => {
            switch (true) {
                case data instanceof Int8Array: return gl.BYTE;
                case data instanceof Uint8Array: return gl.UNSIGNED_BYTE;
                case data instanceof Int16Array: return gl.SHORT;
                case data instanceof Uint16Array: return gl.UNSIGNED_SHORT;
                case data instanceof Int32Array: return gl.INT;
                case data instanceof Uint32Array: return gl.UNSIGNED_INT;
                case data instanceof Float32Array: return gl.FLOAT;
                default: throw new Error('Cannot infer data type from array.');
            }
        })();

        gl.bindBuffer(target, this.buffer);
        gl.bufferData(target, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.location);
        gl.vertexAttribPointer(this.location, itemSize, type, normalized, 0, 0);
        gl.bindBuffer(target, null);
    }
}