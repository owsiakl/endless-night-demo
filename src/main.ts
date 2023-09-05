import {Assets} from "./Assets/Assets";
import {NullLogger} from "./Logger/NullLogger";
import {RenderLoop} from "./Engine/RenderLoop";
import {Loader} from "./GLTF/Loader";
import {Scene} from "./Core/Scene";
import {WebGLRenderer} from "./Renderer/WebGLRenderer";
import {Mesh} from "./Core/Object/Mesh";
import {Material} from "./Core/Material";
import {mat4, quat, vec3, vec4} from "gl-matrix";
import {Keyboard} from "./Input/Keyboard";
import {AnimationControl} from "./Animation/AnimationControl";
import {MovementControl} from "./Movement/MovementControl";
import {Mouse} from "./Input/Mouse";
import {Camera} from "./Camera/Camera";
import {Plane} from "./Model/Plane";
import {DirectionalLight} from "./Light/DirectionalLight";
import {DebugContainer} from "./Debug/DebugContainer";

const url = new URLSearchParams(window.location.search);
const logger = new NullLogger();
const assets = new Assets(logger);

document.addEventListener('DOMContentLoaded', () => assets.preload(main));

async function main()
{
    const debug = url.has('debug') ? DebugContainer.create(document) : null;
    const renderLoop = new RenderLoop(debug);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2', {antialias: false}) as WebGL2RenderingContext;
    const keyboardInput = Keyboard.create();
    const mouseInput = Mouse.create();
    const renderer = new WebGLRenderer(canvas, gl, assets.shaders, debug);

    canvas.width = canvas.offsetWidth;
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.height = canvas.offsetHeight;
    canvas.style.height = `${canvas.offsetHeight}px`;

    // ======= GROUND =======
    const plane = new Mesh(
        Plane.create(30, 30),
        (new Material()).setColor(vec3.fromValues(.8, .8, .9))
    );

    // ======= SOLDIER =======
    const characterModel = await Loader.parseBinary(assets.binaryModels.get('glb_akai'));
    // const characterModel = await Loader.parseBinary(assets.binaryModels.get('glb_soldier'));
    const character = await characterModel.getScene();
    const [idle, run, bind, walk] = characterModel.getAnimation();

    const animations = new AnimationControl(character);
    animations.addClip('idle', idle);
    animations.addClip('walk', walk);
    animations.addClip('run', run);

    const camera = new Camera(canvas, vec3.fromValues(5, 5, 0), mouseInput);
    camera._far = 100;
    camera.follow(character);

    const movement = MovementControl.bind(character, animations, keyboardInput, camera);


    // ======= SCENE =======
    const scene = new Scene();
    const light = new DirectionalLight();
    light.model.translation = vec3.fromValues(0, 4, 4);
    light.follow(character);

    scene.addLight(light);
    scene.add(character);
    scene.add(plane);

    // ======= RENDER =======
    renderLoop.start(time => {
        mouseInput.update();
        camera.update(time);
        movement.update(time);

        if (null !== scene.light)
        {
            scene.light.update(time);
        }

        renderer.render(scene, camera);

        if (null !== debug)
        {
            debug.update(time);
        }
    });
}