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
import {mat4, quat, vec3, vec4} from "gl-matrix";
import {Keyboard} from "./Input/Keyboard";
import {AnimationControl} from "./Animation/AnimationControl";
import {MovementControl} from "./Movement/MovementControl";
import {Mouse} from "./Input/Mouse";
import {Camera} from "./Camera/Camera";
import {Plane} from "./Model/Plane";
import {DirectionalLight} from "./Light/DirectionalLight";


const logger = new NullLogger();
const assets = new Assets(logger);
const renderLoop = new RenderLoop();

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

async function main()
{
    const fpsCounter = document.querySelector('[data-fps-counter]') as HTMLSpanElement;
    const msCPUCounter = document.querySelector('[data-ms-cpu-counter]') as HTMLSpanElement;
    const msGPUCounter = document.querySelector('[data-ms-gpu-counter]') as HTMLSpanElement;
    const heapLimit = document.querySelector('[data-heap-limit]') as HTMLSpanElement;
    const heapAvailable = document.querySelector('[data-heap-available]') as HTMLSpanElement;
    const heapUsed = document.querySelector('[data-heap-used]') as HTMLSpanElement;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2', {antialias: false}) as WebGL2RenderingContext;
    const keyboardInput = Keyboard.create();
    const mouseInput = Mouse.create();

    canvas.width = canvas.offsetWidth;
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.height = canvas.offsetHeight;
    canvas.style.height = `${canvas.offsetHeight}px`;


    const renderer = new WebGLRenderer(canvas, gl, assets.shaders);

    const grid = new Line(
        Grid.create,
        (new Material()).useVertexColors()
    );

    const plane = new Mesh(
        Plane.create(20, 20),
        (new Material())
    );
    plane.material.setColor(vec3.fromValues(.8, .8, .9))

    const cube = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
        (new Material()).setColor(vec3.fromValues(0.6, 0, 0))
    );


    // CESIUM MAN
    // const cesiumModel = await Loader.parse(JSON.parse(assets.models.get('gltf_cesium_man')) as GLTF);
    // const cesium = await cesiumModel.getScene();
    // const [ walk] = cesiumModel.getAnimation();
    // const animations = new AnimationControl(cesium);
    // animations.addClip('walk', walk);

    // CUBE GUY
    const cubeManModel = await Loader.parse(JSON.parse(assets.models.get('gltf_cube_guy')) as GLTF);
    const cubeMan = await cubeManModel.getScene();


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

    const camera = new Camera(canvas, vec3.fromValues(0, 5, 5), mouseInput);
    camera._far = 100;
    camera.follow(soldier);


    const movement = MovementControl.bind(soldier, animations, keyboardInput, camera);





    // ======= LIGHT =======
    // @ts-ignore
    // soldier.children[0].material.useLight(lightPosition)
    // @ts-ignore
    // soldier.children[1].material.useLight(lightPosition)


    // ======= SHADOWING =======
    const cube1 = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
        (new Material()).setColor(vec3.fromValues(0.6, 0, 0))
    );
    cube1.model.translation = vec3.fromValues(-2, 1, 0)

    const cube2 = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
        (new Material()).setColor(vec3.fromValues(0, 0.6, 0))
    );
    cube2.model.translation = vec3.fromValues(0, 0.5, 2)

    const cube3 = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
        (new Material()).setColor(vec3.fromValues(0, 0, 0.6))
    );
    cube3.model.translation = vec3.fromValues(2, 0.25, 0.5)


    // ======= SCENE =======
    const scene = new Scene();
    const light = new DirectionalLight();
    light.model.translation = vec3.fromValues(0, 4, 4);
    light.follow(soldier);

    scene.addLight(light);
    scene.add(soldier);
    scene.add(plane);
    // scene.add(cube1);
    // scene.add(cube2);
    // scene.add(cube3);


    const ext = gl.getExtension( 'EXT_disjoint_timer_query_webgl2' );
    const query = gl.createQuery() as WebGLQuery;
    const gpuTime: Array<float> = [];

    renderLoop.start(time => {
        let available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
        let disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);

        if (available && !disjoint)
        {
            const timeElapsed = gl.getQueryParameter(query, gl.QUERY_RESULT);

            gpuTime.push(timeElapsed * 1e-6);

            if (gpuTime.length >= 60)
            {
                gpuTime.shift();
            }
        }

        gl.beginQuery(ext.TIME_ELAPSED_EXT, query);

        mouseInput.update();
        camera.update(time);
        movement.update(time);

        if (null !== scene.light)
        {
            scene.light.update(time);
        }

        renderer.render(scene, camera);

        gl.endQuery(ext.TIME_ELAPSED_EXT);
    });

    // debug statistics
    setInterval(() => {
        let avg = 0;
        let sum = 0;

        for (let i = 0; i < gpuTime.length; i++)
        {
            sum += gpuTime[i];
        }

        avg = sum / gpuTime.length;

        fpsCounter.innerText = renderLoop.fps.toFixed(2);
        msCPUCounter.innerText = renderLoop.ms.toFixed(2);
        msGPUCounter.innerText = avg.toFixed(2);

        // @ts-ignore
        const memory = window.performance.memory;
        heapLimit.innerText = (memory.jsHeapSizeLimit / 1000000).toFixed(2).concat(' MB');
        heapAvailable.innerText = (memory.totalJSHeapSize / 1000000).toFixed(2).concat(' MB');
        heapUsed.innerText = (memory.usedJSHeapSize / 1000000).toFixed(2).concat(' MB');
    }, 3000);
}