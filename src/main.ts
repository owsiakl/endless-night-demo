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
import {DebugContainer} from "./Debug/DebugContainer";
import {Skeleton} from "./Core/Skeleton";
import {PointLight} from "./Light/PointLight";
import {Particle} from "./Core/Object/Particle";

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

    // ======= CAMERA =======
    const camera = new Camera(canvas, vec3.fromValues(5, 5, 0), mouseInput);
    camera._far = 200;

    // ======= GROUND =======
    const plane = new Mesh(Plane.create(25, 25), (new Material()).setColor(vec3.fromValues(.8, .8, .8)));

    // ======= TORCH =======
    const [torch] = await Loader.parseBinary(assets.binaryModels.get('glb_torch')).then(model => model.getScene());
    torch.translation = vec3.fromValues(0, -0.05, 0);
    torch.rotation = quat.rotateY(quat.create(), quat.create(), Math.PI / 2);

    // ======= CHARACTER =======
    const [character, skeleton, animations] = await Loader.parseBinary(assets.binaryModels.get('glb_akai')).then(model => model.getScene());
    skeleton?.getBone(31).setChild(torch);

    const animationControl = new AnimationControl(skeleton as Skeleton);
    animationControl.addClip('idle', animations![0]);
    animationControl.addClip('walk', animations![2]);
    animationControl.addClip('run', animations![1]);

    const movement = MovementControl.bind(character, animationControl, keyboardInput, camera);

    camera.follow(character);

    // ======= LIGHT =======
    const light = new PointLight();
    light.translation = vec3.fromValues(0, 0.8, 0.4);
    torch.setChild(light);

    // ======= PARTICLE =======
    const particle = new Particle(assets.images.get('fire_particle'), 1_000);
    torch.setChild(particle);
    particle.translation = vec3.fromValues(0, 0.36, 0.0);

    // ======= SCENE =======
    const scene = new Scene();
    scene.addLight(light);
    scene.add(plane);
    scene.add(character);

    // ======= RENDER =======
    renderLoop.start(dt => {
        mouseInput.update();
        camera.update(dt);
        movement.update(dt);
        scene.light.update(dt);

        if (null !== scene.particles)
        {
            scene.particles.update(dt);
        }

        renderer.render(scene, camera);

        if (null !== debug)
        {
            debug.update(dt);
        }
    });
}