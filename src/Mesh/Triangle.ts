import {Program} from "../Engine/Program";

export class Triangle
{
    private readonly vao: WebGLVertexArrayObject
    private readonly program: Program
    private readonly gl: WebGL2RenderingContext

    public constructor(program: Program, gl: WebGL2RenderingContext)
    {
        this.program = program;
        this.gl = gl;
        this.vao = this.gl.createVertexArray()!;
    }

    public preRender(): void
    {
        this.program.setAttributeLocation('a_position');

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0,0,   0,0.5,   0.7,0]), this.gl.STATIC_DRAW);

        this.gl.bindVertexArray(this.vao);

        this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_position'));
        this.gl.vertexAttribPointer(
            this.program.getAttributeLocation('a_position'),
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindVertexArray(null);
    }

    public render(): void
    {
        this.gl.useProgram(this.program.program);
        this.gl.bindVertexArray(this.vao);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)

        this.gl.useProgram(null);
        this.gl.bindVertexArray(null);
    }
}