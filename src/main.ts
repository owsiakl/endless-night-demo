import {Assets} from "./Assets/Assets";
import {ConsoleLogger} from "./Logger/ConsoleLogger";
import {Program} from "./Engine/Program";
import {RenderLoop} from "./Engine/RenderLoop";
import {Cube} from "./Mesh/Cube";
import {Camera} from "./Engine/Camera";
import {Grid} from "./Mesh/Grid";
import {MouseCamera} from "./Engine/MouseCamera";

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
    const camera = new Camera(canvas);

    MouseCamera.control(camera, canvas);

    const grid = new Grid(
        Program.create(
            'grid',
            assets.shaders.get('grid_vertex'),
            assets.shaders.get('grid_fragment'),
            gl,
            logger
        ),
        gl
    );

    const cube = new Cube(
        Program.create(
            'cube',
            assets.shaders.get('cube_vertex'),
            assets.shaders.get('cube_fragment'),
            gl,
            logger
        ),
        gl
    );

    grid.preRender(camera);
    cube.preRender(camera);

    renderLoop.start(time => {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        camera.update();

        grid.render(time, camera);
        cube.render(time, camera);
    });

    // debug statistics
    setInterval(() => {
        fpsCounter.innerText = renderLoop.fps.toFixed(2);
        msCounter.innerText = renderLoop.ms.toFixed(2);
    }, 1000);
}