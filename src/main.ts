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
import {FrustumDebug} from "./Debug/FrustumDebug";
import {DepthTexture} from "./Debug/DepthTexture";

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
        (new Material())
    );
    plane.material.setColor(vec3.fromValues(.8, .8, .9))

    const cube = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
        (new Material()).setColor(vec3.fromValues(0.6, 0, 0))
    );

    const light = new Mesh(
        Cube.create2(0.5, 0.5, 0.5),
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
    camera._far = 100;


    const movement = MovementControl.bind(soldier, animations, keyboardInput, camera);

    camera.follow(soldier);




    // ======= LIGHT =======
    const lightPosition = vec3.fromValues(0, 4, 4);
    const lightTarget = vec3.fromValues(0, 0, 0);

    // @ts-ignore
    // soldier.children[0].material.useLight(lightPosition)
    // @ts-ignore
    // soldier.children[1].material.useLight(lightPosition)

    light.model.translation = lightPosition;


    // ======= SHADOWING =======
    let textureWorldMatrix = mat4.lookAt(
        mat4.create(),
        lightPosition,
        lightTarget,
        [0, 1, 0],
    );

    const perspectiveFOV = 60;
    const perspectiveWidth = 1;
    const perspectiveHeight = 1;
    const perspectiveNear = 1;
    const perspectiveFar = 30;
    // let textureProjectionMatrix = mat4.perspective(mat4.create(), perspectiveFOV * Math.PI / 180, perspectiveWidth / perspectiveHeight, perspectiveNear, perspectiveFar);

    const orthoWidth = 5;
    const orthoNear = 0;
    const orthoFar = 15;
    const textureProjectionMatrix = mat4.ortho(mat4.create(), -orthoWidth, orthoWidth, -orthoWidth, orthoWidth, orthoNear, orthoFar);

    const textureMatrix = mat4.multiply(mat4.create(), textureProjectionMatrix, textureWorldMatrix);

    const frustumDebug = new FrustumDebug();
    frustumDebug.update(mat4.multiply(mat4.create(), textureProjectionMatrix, textureWorldMatrix))




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
    scene.add(light);
    scene.add(soldier);
    // scene.add(frustumDebug.frustumModel);
    // scene.add(cube1);
    // scene.add(cube2);
    // scene.add(cube3);
    scene.add(plane);



    // ======= RENDER =======
    const depthTexture = gl.createTexture();
    const depthTextureSize = 1024;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, depthTextureSize, depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    plane.material.useShadow();
    // @ts-ignore
    soldier.children[0].material.useShadow();
    // @ts-ignore
    soldier.children[0].material.useShadow();
    cube1.material.useShadow();
    cube2.material.useShadow();
    cube3.material.useShadow();

    renderLoop.start(time => {
        mouseInput.update();
        camera.update(time);
        movement.update(time);

        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        renderer.framebuffer(scene, camera, textureMatrix);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // @ts-ignore
        renderer.render(scene, camera, depthTexture, textureMatrix);
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