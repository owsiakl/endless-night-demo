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
import {quat} from "gl-matrix";

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

    const renderer = new WebGLRenderer(canvas, gl, assets.shaders);
    const scene = new Scene();

    const grid = new Line(
        0,
        'line',
        Grid.create,
        (new Material()).useVertexColors()
    );

    const cube = new Mesh(
        0,
        'cube',
        Cube.create,
        (new Material()).useVertexColors()
    );

    // CESIUM MAN
    const cesiumModel = await Loader.parse(JSON.parse(assets.models.get('gltf_cesium_man')) as GLTF);
    const cesium = await cesiumModel.getScene(0);
    cesium.setTranslation([-1.5, 0, 0])
    const cesiumAnims = await Promise.all(cesiumModel.getAnimations());

    // CUBE GUY
    const cubeManModel = await Loader.parse(JSON.parse(assets.models.get('gltf_cube_guy')) as GLTF);
    const cubeMan = await cubeManModel.getScene(0);
    cubeMan.setTranslation([1.5, 0, 0]);
    const cubeManAnims = await Promise.all(cubeManModel.getAnimations());

    // FOX
    const foxModel = await Loader.parseBinary(assets.binaryModels.get('glb_fox'));
    const fox = await foxModel.getScene(0);
    fox.setScale([0.01, 0.01, 0.01]);
    fox.setTranslation([-1.5, 0, -1.5]);
    const foxAnims = await Promise.all(foxModel.getAnimations());

    // SOLDIER
    const soldierModel = await Loader.parseBinary(assets.binaryModels.get('glb_soldier'));
    const soldier = await soldierModel.getScene(0);
    soldier.setRotation(quat.rotateY(quat.create(), quat.create(), Math.PI));
    const soldierAnims = await Promise.all(soldierModel.getAnimations());


    scene.add(grid);
    scene.add(cubeMan);
    scene.add(fox);
    scene.add(cesium);
    scene.add(soldier);

    renderLoop.start(time => {
        cubeManAnims[1].update(time, cubeMan);
        foxAnims[2].update(time, fox);
        cesiumAnims[0].update(time, cesium);
        soldierAnims[1].update(time, soldier);

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