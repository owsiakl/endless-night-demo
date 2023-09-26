export class VertexArrays
{
    private readonly _vaos: Map<number, WebGLVertexArrayObject>;

    public constructor()
    {
        this._vaos = new Map();
    }

    public bind(gl: WebGL2RenderingContext, geometryId: number) : void
    {
        let vao = this._vaos.get(geometryId) ?? null;

        if (null === vao)
        {
            vao = gl.createVertexArray();
        }

        if (null !== vao)
        {
            this._vaos.set(geometryId, vao);
        }
        else
        {
            throw new Error(`Cannot create vertex attribute array.`);
        }

        gl.bindVertexArray(vao);
    }

    public unbind(gl: WebGL2RenderingContext) : void
    {
        gl.bindVertexArray(null);
    }
}