import {Assets} from "./Assets/Assets";
import {ConsoleLogger} from "./Logger/ConsoleLogger";
import {Program} from "./Engine/Program";
import {Triangle} from "./Mesh/Triangle";
import {RenderLoop} from "./Engine/RenderLoop";

const logger = new ConsoleLogger();
const assets = new Assets(logger);
const renderLoop = new RenderLoop();

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

function main()
{
    const fpsCounter = document.querySelector('[data-fps-counter]') as HTMLSpanElement;
    const msCounter = document.querySelector('[data-ms-counter]') as HTMLSpanElement;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

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

    renderLoop.start((time) => {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        triangle.render();
    });

    // debug statistics
    setInterval(() => {
        fpsCounter.innerText = renderLoop.fps.toFixed(2);
        msCounter.innerText = renderLoop.ms.toFixed(2);
    }, 1000);
}