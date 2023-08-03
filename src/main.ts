import {Assets} from "./Assets/Assets";
import {NullLogger} from "./Logger/NullLogger";
import {Program} from "./Engine/Program";
import {RenderLoop} from "./Engine/RenderLoop";
import {Camera} from "./Engine/Camera";
import {MouseCamera} from "./Engine/MouseCamera";
import {TestGLTF} from "./Mesh/TestGLTF";
import {Loader} from "./GLTF/Loader";
import {Scene} from "./Core/Scene";
import {WebGLRenderer} from "./Renderer/WebGLRenderer";
import {Grid} from "./Model/Grid";
import {Cube} from "./Model/Cube";
import {ShaderMaterial} from "./Core/Material/ShaderMaterial";
import {Mesh} from "./Core/Object/Mesh";
import {Line} from "./Core/Object/Line";

const logger = new NullLogger();
const assets = new Assets(logger);
const renderLoop = new RenderLoop();

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

function main()
{
    const fpsCounter = document.querySelector('[data-fps-counter]') as HTMLSpanElement;
    const msCounter = document.querySelector('[data-ms-counter]') as HTMLSpanElement;
    const heapLimit = document.querySelector('[data-heap-limit]') as HTMLSpanElement;
    const heapAvailable = document.querySelector('[data-heap-available]') as HTMLSpanElement;
    const heapUsed = document.querySelector('[data-heap-used]') as HTMLSpanElement;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    const camera = new Camera(canvas);

    canvas.width = canvas.offsetWidth;
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.height = canvas.offsetHeight;
    canvas.style.height = `${canvas.offsetHeight}px`;

    MouseCamera.control(camera, canvas);


    const gltf = new TestGLTF(
        Program.create(
            'gltf',
            assets.shaders.get('triangle_vertex'),
            assets.shaders.get('triangle_fragment'),
            gl,
            logger
        ),
        gl,
        // Loader.parse(JSON.parse(assets.models.get('gltf_triangle')) as GLTF),
        Loader.parse(JSON.parse(assets.models.get('gltf_cube_guy')) as GLTF),
        // Loader.parse(JSON.parse(assets.models.get('gltf_cesium_man')) as GLTF),
        assets
    );


    gltf.preRender(camera);



    const renderer = new WebGLRenderer(canvas, gl);
    const scene = new Scene();

    const grid = new Line(
        Grid.create,
        new ShaderMaterial(assets.shaders.get('cube_vertex').textContent, assets.shaders.get('cube_fragment').textContent)
    );

    const cube = new Mesh(
        Cube.create,
        new ShaderMaterial(assets.shaders.get('cube_vertex').textContent, assets.shaders.get('cube_fragment').textContent)
    );

    scene.add(grid);
    scene.add(cube);

    renderLoop.start(time => {
        camera.update();
        renderer.render(scene, camera);
        gltf.render(time, camera);
    });

    // debug statistics
    setInterval(() => {
        fpsCounter.innerText = renderLoop.fps.toFixed(2);
        msCounter.innerText = renderLoop.ms.toFixed(2);

        // @ts-ignore
        const memory = window.performance.memory;
        heapLimit.innerText = (memory.jsHeapSizeLimit / 1000000).toFixed(2).concat(' MB');
        heapAvailable.innerText = (memory.totalJSHeapSize / 1000000).toFixed(2).concat(' MB');
        heapUsed.innerText = (memory.usedJSHeapSize / 1000000).toFixed(2).concat(' MB');
    }, 5000);
}