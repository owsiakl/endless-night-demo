import {Assets} from "./Assets/Assets";
import {NullLogger} from "./Logger/NullLogger";
import {RenderLoop} from "./Engine/RenderLoop";
import {Camera} from "./Engine/Camera";
import {MouseCamera} from "./Engine/MouseCamera";
import {Loader} from "./GLTF/Loader";
import {Scene} from "./Core/Scene";
import {WebGLRenderer} from "./Renderer/WebGLRenderer";
import {Grid} from "./Model/Grid";
import {Cube} from "./Model/Cube";
import {Mesh} from "./Core/Object/Mesh";
import {Line} from "./Core/Object/Line";
import {Material} from "./Core/Material";

const logger = new NullLogger();
const assets = new Assets(logger);
const renderLoop = new RenderLoop();

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

async function main()
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

    const renderer = new WebGLRenderer(canvas, gl);
    const scene = new Scene();

    const grid = new Line(
        'line',
        Grid.create,
        new Material(assets.shaders.get('cube_vertex').textContent, assets.shaders.get('cube_fragment').textContent)
    );

    const cube = new Mesh(
        'cube',
        Cube.create,
        new Material(assets.shaders.get('cube_vertex').textContent, assets.shaders.get('cube_fragment').textContent)
    );


    // CUBE GUY
    const model = await Loader.parse(JSON.parse(assets.models.get('gltf_cube_guy')) as GLTF);
    const cubeMan = await model.load();
    cubeMan.material.vertexShader = assets.shaders.get('triangle_vertex').textContent;
    cubeMan.material.fragmentShader = assets.shaders.get('triangle_fragment').textContent;

    // FOX
    // const foxModel = await Loader.parse(JSON.parse(assets.models.get('gltf_fox')) as GLTF);
    const foxModel = await Loader.parseBinary(assets.binaryModels.get('glb_fox'));
    const fox = await foxModel.load();
    fox.material.vertexShader = assets.shaders.get('triangle_vertex').textContent;
    fox.material.fragmentShader = assets.shaders.get('triangle_fragment').textContent;
    fox.setScale([0.01, 0.01, 0.01]);
    fox.setTranslation([1, 0, 0]);


    // @ts-ignore





    scene.add(grid);
    // scene.add(cube);
    scene.add(cubeMan);
    scene.add(fox);

    renderLoop.start(time => {
        cubeMan.animations[1].update(time, cubeMan.skeleton);
        fox.animations[2].update(time, fox.skeleton);
        camera.update();
        renderer.render(scene, camera);
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