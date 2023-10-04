import {DebugContainer} from "../Debug/DebugContainer";
import {RenderLoop} from "../Core/RenderLoop";
import {WindowDecorator} from "../Core/WindowDecorator";
import {Keyboard} from "../Input/Keyboard";
import {Mouse} from "../Input/Mouse";
import {Camera} from "../Camera/Camera";
import {quat, vec3} from "gl-matrix";
import {AnimationControl} from "../Animation/AnimationControl";
import {MovementControl} from "../Movement/MovementControl";
import {PointLight} from "../Light/PointLight";
import {Fire} from "../Model/Fire";
import {Scene} from "../Core/Scene";
import {Assets} from "../Core/Assets";
import {Ground} from "../Model/Ground";
import {Renderer} from "../Core/Renderer";

export class EndlessNight
{
    private readonly _assets: Assets;
    private readonly _debug: Nullable<DebugContainer>;
    private readonly _loop: RenderLoop;
    private readonly _renderer: Renderer;
    private readonly _keyboard: Keyboard;
    private readonly _mouse: Mouse;

    public constructor(window: WindowDecorator, assets: Assets, renderer: Renderer, debug: Nullable<DebugContainer>)
    {
        this._assets = assets;
        this._debug = debug;
        this._loop = new RenderLoop(debug);
        this._renderer = renderer;
        this._keyboard = new Keyboard(window);
        this._mouse = new Mouse(window);
    }

    public bootstrap() : void
    {
        // ======= CAMERA =======
        const camera = new Camera(this._renderer.canvas, vec3.fromValues(0, 4.5, 4.5), this._mouse);

        // ======= GROUND =======
        const ground = new Ground(this._assets);

        // ======= TORCH =======
        const [torch] = this._assets.model('torch').scene;
        torch.translation = vec3.fromValues(0, -0.05, 0);
        torch.rotation = quat.rotateY(quat.create(), quat.create(), Math.PI / 2);

        // ======= CHARACTER =======
        const [character, skeleton, animations] = this._assets.model('akai').scene;
        character.rotation = quat.rotateY(quat.create(), quat.create(), 0.7);
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

        // ======= FIRE =======
        const fire = Fire.create(this._assets);
        torch.setChild(fire);
        fire.translation = vec3.fromValues(0, 0.55, 0.0);

        // ======= SCENE =======
        const scene = new Scene();
        scene.addLight(light);
        scene.add(...ground.tiles);
        scene.add(character);
        scene.add(fire);

        // ======= LOOP =======
        this._loop.start((dt, time) => {
            this._mouse.update();
            camera.update(dt);
            movement.update(dt);
            ground.update(character.translation);
            scene.light?.update(dt);
            fire.update(time, movement);

            this._renderer.render(scene, camera);

            this._debug?.update(dt);
        });
    }
}