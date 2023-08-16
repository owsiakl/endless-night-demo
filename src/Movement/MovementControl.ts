import {AnimationControl} from "../Animation/AnimationControl";
import {StateMachine} from "../State/StateMachine";
import {IdleState} from "./IdleState";
import {WalkState} from "./WalkState";
import {RunState} from "./RunState";
import {Keyboard} from "../Input/Keyboard";
import {Camera} from "../Engine/Camera";
import {quat, vec3} from "gl-matrix";
import {Object3D} from "../Core/Object3D";

export class MovementControl extends StateMachine
{
    public readonly object: Object3D;
    public readonly animations: AnimationControl;
    public readonly input: Keyboard;
    public readonly camera: Camera;

    private readonly acceleration = 7;
    private readonly deceleration = -4;
    private velocity = 0.0;

    private constructor(object: Object3D, animations: AnimationControl, input: Keyboard, camera: Camera)
    {
        super();

        this.object = object;
        this.animations = animations;
        this.input = input;
        this.camera = camera;
    }

    public static bind(object: Object3D, animations: AnimationControl, input: Keyboard, camera: Camera) : MovementControl
    {
        const self = new MovementControl(object, animations, input, camera);

        self.addState('idle', new IdleState(self));
        self.addState('walk', new WalkState(self));
        self.addState('run', new RunState(self));

        self.setState('idle');

        self.camera.update();
        self.object.model.rotation = camera.invertRotY;

        return self;
    }

    update(dt: float)
    {
        super.update(dt);

        this.animations.update(dt);

        let forward = vec3.fromValues(0, 0, 0);
        let cameraRot = this.camera.invertRotY;

        let frameDeceleration = this.velocity * this.deceleration;
        frameDeceleration = frameDeceleration * dt;
        frameDeceleration = Math.sign(frameDeceleration) * Math.min(Math.abs(frameDeceleration), Math.abs(this.velocity));

        this.velocity = this.velocity + frameDeceleration;
        this.velocity += this.acceleration * dt;

        if (this.input.forward)
        {
            forward = vec3.fromValues(0, 0, -1);
            vec3.transformQuat(forward, forward, cameraRot);
            vec3.scale(forward, forward, this.velocity * dt);

            this.object.model.rotation = cameraRot;
        }

        if (this.input.right)
        {
            forward = vec3.fromValues(1, 0, 0);
            vec3.transformQuat(forward, forward, cameraRot);
            vec3.scale(forward, forward, this.velocity * dt);

            this.object.model.rotation = quat.rotateY(quat.create(), cameraRot, -Math.PI / 2);
        }

        if (this.input.back)
        {
            forward = vec3.fromValues(0, 0, 1);
            vec3.transformQuat(forward, forward, cameraRot);
            vec3.scale(forward, forward, this.velocity * dt);

            this.object.model.rotation = quat.rotateY(quat.create(), cameraRot, -Math.PI);
        }

        if (this.input.left)
        {
            forward = vec3.fromValues(-1, 0, 0);
            vec3.transformQuat(forward, forward, cameraRot);
            vec3.scale(forward, forward, this.velocity * dt);

            this.object.model.rotation = quat.rotateY(quat.create(), cameraRot, Math.PI / 2);
        }

        this.object.model.translation = vec3.add(vec3.create(), this.object.model.translation, forward);
    }

    public get moving() : boolean
    {
        return this.input.forward || this.input.right || this.input.back || this.input.left;
    }

    public get running() : boolean
    {
        return this.input.shift;
    }
}