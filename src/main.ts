import {Assets} from "./Assets/Assets";
import {NullLogger} from "./Logger/NullLogger";
import {RenderLoop} from "./Engine/RenderLoop";
import {Loader} from "./GLTF/Loader";
import {Scene} from "./Core/Scene";
import {WebGLRenderer} from "./Renderer/WebGLRenderer";
import {Grid} from "./Model/Grid";
import {Cube} from "./Model/Cube";
import {Mesh} from "./Core/Object/Mesh";
import {Line} from "./Core/Object/Line";
import {Material} from "./Core/Material";
import {mat4, quat, vec2, vec3} from "gl-matrix";
import {Keyboard} from "./Input/Keyboard";
import {AnimationControl} from "./Animation/AnimationControl";
import {MovementControl} from "./Movement/MovementControl";
import {Mouse} from "./Input/Mouse";
import {Camera} from "./Camera/Camera";

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
    const keyboardInput = Keyboard.create();
    const mouseInput = Mouse.create();

    canvas.width = canvas.offsetWidth;
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.height = canvas.offsetHeight;
    canvas.style.height = `${canvas.offsetHeight}px`;


    const renderer = new WebGLRenderer(canvas, gl, assets.shaders);
    const scene = new Scene();

    const grid = new Line(
        Grid.create,
        (new Material()).useVertexColors()
    );

    const cube = new Mesh(
        Cube.create,
        (new Material()).useVertexColors()
    );

    // CESIUM MAN
    // const cesiumModel = await Loader.parse(JSON.parse(assets.models.get('gltf_cesium_man')) as GLTF);
    // const cesium = await cesiumModel.getScene();

    // CUBE GUY
    // const cubeManModel = await Loader.parse(JSON.parse(assets.models.get('gltf_cube_guy')) as GLTF);
    // const cubeMan = await cubeManModel.getScene();

    // FOX
    // const foxModel = await Loader.parseBinary(assets.binaryModels.get('glb_fox'));
    // const fox = await foxModel.getScene();
    // fox.model.scale = [0.01, 0.01, 0.01];
    // fox.model.translation = [0, 0, -1.5];

    // SOLDIER
    const soldierModel = await Loader.parseBinary(assets.binaryModels.get('glb_soldier'));
    const soldier = await soldierModel.getScene();
    const [idle, run, bind, walk] = soldierModel.getAnimation();

    const animations = new AnimationControl(soldier);
    animations.addClip('idle', idle);
    animations.addClip('walk', walk);
    animations.addClip('run', run);

    const camera = new Camera(canvas, vec3.fromValues(0, 3, 5), mouseInput);
    const movement = MovementControl.bind(soldier, animations, keyboardInput, camera);

    camera.follow(soldier);

    scene.add(grid);
    scene.add(cube);
    scene.add(soldier);

    renderLoop.start(time => {
        mouseInput.update();
        camera.update(time);
        movement.update(time);
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