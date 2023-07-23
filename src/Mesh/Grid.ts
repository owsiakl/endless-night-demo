import {mat4} from "gl-matrix";
import {Program} from "../Engine/Program";
import {Mesh} from "./Mesh";
import {Camera} from "../Engine/Camera";

export class Grid implements Mesh
{
    private gl: WebGL2RenderingContext;
    private program: Program;
    private vao: WebGLVertexArrayObject | null;
    private verticesLength: number = 0;

    public constructor(program: Program, gl: WebGL2RenderingContext)
    {
        this.gl = gl;
        this.program = program;
        this.vao = null;
    }

    preRender(camera: Camera): void
    {
        this.program.setAttributeLocation('a_position');
        this.program.setAttributeLocation('a_color');
        this.program.setUniformLocation('u_model');
        this.program.setUniformLocation('u_view');
        this.program.setUniformLocation('u_projection');
        this.program.setUniformLocation('u_color');

        this._prepareMesh();

        this.gl.useProgram(this.program.program);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_projection'), false, camera.projectionMatrix);

        this.gl.useProgram(null);
    }

    render(time: number, camera: Camera): void
    {

        this.gl.useProgram(this.program.program);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_model'), false, mat4.create());
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_view'), false, camera.viewMatrix);

        this.gl.bindVertexArray(this.vao);

        this.gl.drawArrays(this.gl.LINES, 0, this.verticesLength);
        this.gl.useProgram(null);
        this.gl.bindVertexArray(null);
    }

    /**
     * @private
     */
    _prepareMesh()
    {
        let cellSize = 1;
        let columns = 20;

        let gridColors = [
            0.4, 0.4, 0.4,
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
        ];

        let vertices = [];
        let currentLine = -columns * cellSize;

        for (let i = 0; i <= columns * 2; i++) {
            vertices.push(currentLine, 0, -columns * cellSize, 0);
            vertices.push(currentLine, 0, columns * cellSize, 0);

            vertices.push( -columns * cellSize, 0, currentLine, 0);
            vertices.push(columns * cellSize, 0, currentLine, 0);

            currentLine += cellSize;
        }

        // Y direction - blue
        vertices.push(-0.0001, 0, 0, 3,  -0.0001, 5, 0, 3);
        vertices.push(0.0001, 0, 0, 3,   0.0001, 5, 0, 3);
        vertices.push(0, 0, -0.0001, 3,  0, 5, -0.0001, 3);
        vertices.push(0, 0, 0.0001, 3,   0, 5, 0.0001, 3);

        // X direction - red
        vertices.push(0, -0.0001, 0, 1,  5, -0.0001, 0, 1);
        vertices.push(0, 0.0001, 0, 1,   5, 0.0001, 0, 1);
        vertices.push(0, 0, -0.0001, 1,  5, 0, -0.0001, 1);
        vertices.push(0, 0, 0.0001, 1,   5, 0, 0.0001, 1);

        // Z direction - green
        vertices.push(-0.0001, 0, 0, 2,  -0.0001, 0, 5, 2);
        vertices.push(0, 0.0001, 0, 2,   0, 0.0001, 5, 2);
        vertices.push(0, -0.0001, 0, 2,  0, -0.0001, 5, 2);
        vertices.push(0.0001, 0, 0, 2,   0.0001, 0, 5, 2);

        this.verticesLength = vertices.length / 4;


        // vao
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        // set buffers
        let positionBuffer = this.gl. createBuffer();
        let stride = Float32Array.BYTES_PER_ELEMENT * 4;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_position'));
        this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_position'), 3, this.gl.FLOAT, false, stride, 0);

        this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_color'));
        this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_color'), 1, this.gl.FLOAT, false, stride, Float32Array.BYTES_PER_ELEMENT * 3);


        // unbind
        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);


        // set colors
        this.gl.useProgram(this.program.program);
        this.gl.uniform3fv(this.program.getUniformLocation('u_color'), new Float32Array(gridColors));
        this.gl.useProgram(null);
    }
}