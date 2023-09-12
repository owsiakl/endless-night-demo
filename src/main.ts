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
import {Skeleton} from "./Core/Skeleton";
import {Cube} from "./Model/Cube";
import {PointLight} from "./Light/PointLight";

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
    // const plane = new Line(Grid.create, (new Material()).useVertexColors());
    const plane = new Mesh(Plane.create(50, 50), (new Material()).setColor(vec3.fromValues(.8, .8, .8)));

    // ======= TORCH =======
    const [torch] = await Loader.parseBinary(assets.binaryModels.get('glb_torch')).then(model => model.getScene());
    torch.translation = vec3.fromValues(0, -0.05, 0);
    torch.traverse(child => { if (child instanceof Mesh) child.material.disableShadows() })

    // ======= CHARACTER =======
    const [character, skeleton, animations] = await Loader.parseBinary(assets.binaryModels.get('glb_akai')).then(model => model.getScene());
    skeleton?.getBone(31).setChild(torch);


    const animationControl = new AnimationControl(skeleton as Skeleton);
    animationControl.addClip('idle', animations![0]);
    animationControl.addClip('walk', animations![2]);
    animationControl.addClip('run', animations![1]);

    const camera = new Camera(canvas, vec3.fromValues(5, 5, 0), mouseInput);
    camera._far = 100;
    camera.follow(character);

    const movement = MovementControl.bind(character, animationControl, keyboardInput, camera);

    // ======= LIGHT =======
    // const light = new DirectionalLight();
    // light.translation = vec3.fromValues(0, 4, 4);
    // light.follow(character);

    const light = new PointLight();
    light.translation = vec3.fromValues(0.4, 0.8, 0);
    torch.setChild(light);


    // ======= SCENE =======
    const scene = new Scene();
    scene.addLight(light);
    scene.add(plane);

    const redBox = new Mesh(Cube.create(0.5), (new Material()).setColor(vec3.fromValues(.6, .0, .0)));
    redBox.translation = vec3.fromValues(2, 0.5, 0);

    const greenBox = new Mesh(Cube.create(0.5), (new Material()).setColor(vec3.fromValues(.0, .6, .0)));
    greenBox.translation = vec3.fromValues(-2, 0.5, -1);

    const blueBox = new Mesh(Cube.create(0.5), (new Material()).setColor(vec3.fromValues(.0, .0, .6)));
    blueBox.translation = vec3.fromValues(-1, 0.5, 1);

    const lightBox = new Mesh(Cube.create(0.05), (new Material()).setColor(vec3.fromValues(1.0, 1.0, .5)));
    lightBox.translation = light.translation;
    lightBox.material.disableShadows();
    torch.setChild(lightBox);

    scene.add(redBox);
    scene.add(greenBox);
    scene.add(blueBox);
    scene.add(character);

    // ======= RENDER =======
    renderLoop.start(time => {
        mouseInput.update();
        camera.update(time);
        movement.update(time);
        light.update(time);

        renderer.render(scene, camera);

        if (null !== debug)
        {
            debug.update(time);
        }
    });
}