import {DebugContainer} from "../Debug/DebugContainer";
import {RenderLoop} from "../Core/RenderLoop";
import {WebGLRenderer} from "../Renderer/WebGLRenderer";
import {WindowDecorator} from "../Core/WindowDecorator";
import {Keyboard} from "../Input/Keyboard";
import {Mouse} from "../Input/Mouse";
import {Camera} from "../Camera/Camera";
import {quat, vec3} from "gl-matrix";
import {AnimationControl} from "../Animation/AnimationControl";
import {MovementControl} from "../Movement/MovementControl";
import {PointLight} from "../Light/PointLight";
import {Particle} from "../Core/Object/Particle";
import {Scene} from "../Core/Scene";
import {Assets} from "../Core/Assets";
import {Map} from "../Model/Map";
import {Renderer} from "../Core/Renderer";

export class EndlessNight
{
    private readonly _window: WindowDecorator;
    private readonly _assets: Assets;
    private readonly _debug: Nullable<DebugContainer>;
    private readonly _loop: RenderLoop;
    private readonly _renderer: Renderer;
    private readonly _keyboard: Keyboard;
    private readonly _mouse: Mouse;

    constructor(windowDecorator: WindowDecorator, assets: Assets)
    {
        this._window = windowDecorator;
        this._assets = assets;
        this._debug = this._window.debug ? DebugContainer.create(this._window) : null;
        this._loop = new RenderLoop(this._debug);
        this._renderer = new WebGLRenderer(this._window, this._assets, this._debug);
        this._keyboard = new Keyboard(this._window);
        this._mouse = new Mouse(this._window);
    }

    public bootstrap() : void
    {
        // ======= CAMERA =======
        const camera = new Camera(this._renderer.canvas, vec3.fromValues(4, 4, 0), this._mouse);

        // ======= GROUND =======
        const map = new Map(this._assets);

        // ======= TORCH =======
        const [torch] = this._assets.model('torch').scene;
        torch.translation = vec3.fromValues(0, -0.05, 0);
        torch.rotation = quat.rotateY(quat.create(), quat.create(), Math.PI / 2);

        // ======= CHARACTER =======
        const [character, skeleton, animations] = this._assets.model('akai').scene;
        skeleton?.getBone(31).setChild(torch);
        camera.follow(character);

        const animationControl = new AnimationControl(skeleton!);
        animationControl.addClip('idle', animations![0]);
        animationControl.addClip('walk', animations![2]);
        animationControl.addClip('run', animations![1]);

        const movement = MovementControl.bind(character, animationControl, this._keyboard, camera);

        // ======= LIGHT =======
        const light = new PointLight();
        light.translation = vec3.fromValues(0, 0.8, 0.2);
        torch.setChild(light);

        // ======= PARTICLE =======
        const particle = new Particle(this._assets.image('fire_particle'), 1_000);
        torch.setChild(particle);
        particle.translation = vec3.fromValues(0, 0.36, 0.0);

        // ======= SCENE =======
        const scene = new Scene();
        scene.addLight(light);
        scene.add(...map.tiles);
        scene.add(character);

        // ======= LOOP =======
        this._loop.start(dt => {
            this._mouse.update();
            camera.update(dt);
            movement.update(dt);
            map.update(character.translation);
            scene.light.update(dt);

            if (null !== scene.particles)
            {
                scene.particles.update(dt);
            }

            this._renderer.render(scene, camera);

            if (null !== this._debug)
            {
                this._debug.update(dt);
            }
        });
    }
}