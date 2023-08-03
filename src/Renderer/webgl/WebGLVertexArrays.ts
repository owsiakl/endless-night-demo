export class WebGLVertexArrays
{
    private vaos: Map<number, WebGLVertexArrayObject> = new Map();

    public bind(gl: WebGL2RenderingContext, geometryId: number) : void
    {
        let vao = this.vaos.get(geometryId) ?? null;

        if (null === vao) {
            vao = gl.createVertexArray();
        }

        if (null === vao) {
            throw new Error(`Cannot create vertex attribute array.`);
        }

        this.vaos.set(geometryId, vao);

        gl.bindVertexArray(vao);
    }

    public unbind(gl: WebGL2RenderingContext) : void
    {
        gl.bindVertexArray(null);
    }
}