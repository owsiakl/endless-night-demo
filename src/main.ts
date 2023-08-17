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
import {mat4, vec3, vec4} from "gl-matrix";
import {Keyboard} from "./Input/Keyboard";
import {AnimationControl} from "./Animation/AnimationControl";
import {MovementControl} from "./Movement/MovementControl";
import {Mouse} from "./Input/Mouse";
import {Camera} from "./Camera/Camera";
import {Plane} from "./Model/Plane";
import {CameraPosition} from "./Camera/CameraPosition";
import {CameraDebug} from "./Debug/CameraDebug";
import {Geometry} from "./Core/Geometry";
import {Transform} from "./Core/Transform";

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

    const grid = new Line(
        Grid.create,
        (new Material()).useVertexColors()
    );

    const plane = new Mesh(
        Plane.create(20, 20),
        (new Material()).setColor(vec3.fromValues(.8, .8, .8))
    );

    const cube = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
        (new Material()).setColor(vec3.fromValues(0.6, 0, 0))
    );

    const light = new Mesh(
        Cube.create2(.06, .06, .06),
        (new Material()).setColor(vec3.fromValues(1, 1, 0))
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
    camera.splitScreen(CameraPosition.TOP);


    const movement = MovementControl.bind(soldier, animations, keyboardInput, camera);

    camera.follow(soldier);


    cube.model.translation = vec3.fromValues(0, 1, 0);
    cubeMan.model.translation = vec3.fromValues(0, 0, 0);








    // ======= SHADOWING =======




    const textureWorldMatrix = mat4.lookAt(
        mat4.create(),
        [1, 5, 1],
        [0, 0, 0],
        [0, 1, 0],
    );

    const textureMatrix = mat4.invert(mat4.create(), textureWorldMatrix);

    // @ts-ignore
    cubeMan.children[0].material.useShadow(
        assets.images.get('f-texture'),
        textureWorldMatrix
    );

    // @ts-ignore
    soldier.children[0].material.useShadow(
        assets.images.get('f-texture'),
        textureWorldMatrix
    );

    plane.material.useShadow(
        assets.images.get('f-texture'),
        textureWorldMatrix
    );

    const positions = [
        0,  0, -1,
        1,  0, -1,
        0,  1, -1,
        1,  1, -1,
        0,  0,  1,
        1,  0,  1,
        0,  1,  1,
        1,  1,  1,
    ];
    const indices = [
        0, 1,
        1, 3,
        3, 2,
        2, 0,

        4, 5,
        5, 7,
        7, 6,
        6, 4,

        0, 4,
        1, 5,
        3, 7,
        2, 6,
    ];

    const geometry = new Geometry();

    geometry.setAttribute('a_position', new Float32Array(positions), 3);
    geometry.index = new Uint16Array(indices);
    geometry.count = indices.length;

    const cubeLines = new Line(
        geometry,
        (new Material()).setColor(vec3.fromValues(0, 0, 0))
    )

    cubeLines.model = Transform.fromMatrix(textureMatrix);
    cubeLines.model.scale = vec3.fromValues(1, 1, 10);



    // ======= SCENE =======
    const scene = new Scene();
    scene.add(plane);
    // scene.add(grid);
    // scene.add(cube);
    // scene.add(soldier);
    // scene.add(light);
    scene.add(cubeLines);
    scene.add(soldier);



    // ======= LIGHT =======
    const lightPosition = vec3.fromValues(0, 1, 1);

    // @ts-ignore
    soldier.children[0].material.useLight(lightPosition)
    // @ts-ignore
    soldier.children[1].material.useLight(lightPosition)

    light.model.translation = lightPosition;





    // ======= DEBUG =======
    const cameraDebug = new CameraDebug(camera);

    const debugScene = new Scene();
    debugScene.add(plane);
    // debugScene.add(grid);
    // debugScene.add(cube);
    // debugScene.add(light);
    debugScene.add(cameraDebug.cameraModel);
    debugScene.add(cameraDebug.frustumModel);
    debugScene.add(cubeLines);
    debugScene.add(soldier);

    const debugCamera = new Camera(canvas, vec3.fromValues(0, 20, 20), mouseInput);
    debugCamera._far = 100;
    debugCamera.splitScreen(CameraPosition.BOTTOM);













    // ======= RENDER =======

    renderLoop.start(time => {
        mouseInput.update();
        camera.update(time);
        // movement.update(time);
        renderer.render(scene, camera);


        // ======= DEBUG =======
        vec3.rotateY(debugCamera._position, debugCamera._position, debugCamera._target, time * .3);
        debugCamera.calculateViewMatrix();

        cameraDebug.update();
        renderer.render(debugScene, debugCamera);
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