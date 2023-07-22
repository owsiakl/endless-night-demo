import {mat4, vec3} from "gl-matrix";
import { Camera } from "../Engine/Camera";
import { Program } from "../Engine/Program";
import {Mesh} from "./Mesh";

export class Cube implements Mesh
{
    private gl: WebGL2RenderingContext;
    private program: Program;
    private vao: WebGLVertexArrayObject | null;
    private rotation: vec3 = vec3.fromValues(0, 0, 0);
    private position: vec3 = vec3.fromValues(0, 0, -300);
    public verticesCount = 0;

    constructor(program: Program, gl: WebGL2RenderingContext)
    {
        this.gl = gl;
        this.program = program;
        this.vao = null;
    }

    preRender(camera: Camera): void
    {
        this.program.setAttributeLocation('a_position');
        this.program.setAttributeLocation('a_color');
        this.program.setUniformLocation('u_projection');
        this.program.setUniformLocation('u_view');
        this.program.setUniformLocation('u_model');

        this.vao = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.vao);
    
        /* ----- POSITIONS ----- */
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            50, 50, 50,
            -50, 50, 50,
            -50, -50, 50,
            50, -50, 50,

            50, 50, -50,
            -50, 50, -50,
            -50, -50, -50,
            50, -50, -50,
        ];

        this.verticesCount = positions.length;
    
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(positions),
            this.gl.STATIC_DRAW
        );
    
    
        this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_position'));
        this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_position'), 3, this.gl.FLOAT, false, 0, 0);
    
        
        /* ----- COLORS ----- */
        const colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Uint8Array([
                10, 10, 10,
                10, 10, 200,
                10, 200, 10,
                10, 200, 200,
                200, 10, 10,
                200, 10, 200,
                200, 200, 10,
                200, 200, 200,
            ]),
            this.gl.STATIC_DRAW
        );
    
        this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_color'));
        this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_color'), 3, this.gl.UNSIGNED_BYTE, true, 0, 0);
    
        
        /* ----- INDICES ----- */
        const indicesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array([
                0, 1, 2,
                2, 3, 0,
    
                6, 5, 4,
                4, 7, 6,
    
                4, 5, 1,
                1, 0, 4,
    
                3, 2, 6,
                6, 7, 3,
    
                4, 0, 3,
                3, 7, 4,
    
                1, 5, 6,
                6, 2, 1,
            ]),
            this.gl.STATIC_DRAW
        );
    
        this.gl.bindVertexArray(null);
        
        /* ----- UNIFORMS ----- */
        this.gl.useProgram(this.program.program);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_projection'), false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_view'), false, camera.viewMatrix);
        this.gl.useProgram(null);
    }

    render(time: number, camera: Camera): void
    {
        this.rotation[0] += time / 1;
        this.rotation[1] += time / 3;
        this.rotation[2] += time / 5;

        this.gl.useProgram(this.program.program);
        this.gl.bindVertexArray(this.vao);

        let modelMatrix = mat4.create();

        mat4.translate(modelMatrix, modelMatrix, this.position);

        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);


        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_model'), false, modelMatrix);
        this.gl.drawElements(this.gl.TRIANGLES, 6 * 6, this.gl.UNSIGNED_SHORT, 0);

        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }
}