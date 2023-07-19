import {Assets} from "./Assets/Assets";
import {ConsoleLogger} from "./Logger/ConsoleLogger";
import {Program} from "./Engine/Program";

const logger = new ConsoleLogger();
const assets = new Assets(logger);

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

function main()
{
    const canvas = document.querySelector('canvas')!;
    const gl = canvas.getContext('webgl2')!;

    const triangle = Program.create(
        'triangle',
        assets.shaders.get('triangle_vertex'),
        assets.shaders.get('triangle_fragment'),
        gl,
        logger
    );

    triangle.setAttributeLocation('a_position');

    // POSITIONS
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,   0,0.5,   0.7,0]), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(triangle.getAttributeLocation('a_position'));
    gl.vertexAttribPointer(
        triangle.getAttributeLocation('a_position'),
        2,
        gl.FLOAT,
        false,
        0,
        0,
    );

    gl.bindVertexArray(null);

    // DRAW
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(triangle.program);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}