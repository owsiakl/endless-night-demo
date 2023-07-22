import {Assets} from "./Assets/Assets";
import {ConsoleLogger} from "./Logger/ConsoleLogger";
import {Program} from "./Engine/Program";
import {Triangle} from "./Mesh/Triangle";

const logger = new ConsoleLogger();
const assets = new Assets(logger);

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

function main()
{
    const canvas = document.querySelector('canvas')!;
    const gl = canvas.getContext('webgl2')!;

    const triangle = new Triangle(
        Program.create(
            'triangle',
            assets.shaders.get('triangle_vertex'),
            assets.shaders.get('triangle_fragment'),
            gl,
            logger
        ),
        gl
    );

    triangle.preRender();

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    triangle.render();
}