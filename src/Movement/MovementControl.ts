import {AnimationControl} from "../Animation/AnimationControl";
import {StateMachine} from "../State/StateMachine";
import {IdleState} from "./IdleState";
import {WalkState} from "./WalkState";
import {RunState} from "./RunState";
import {Keyboard} from "../Input/Keyboard";
import {quat, vec3} from "gl-matrix";
import {Object3D} from "../Core/Object3D";
import {Camera} from "../Camera/Camera";

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

        self.object.model.rotation = camera.invertRotY;

        return self;
    }

    update(dt: float)
    {
        super.update(dt);

        this.animations.update(dt);

        if (!this.moving)
        {
            return;
        }

        let forward = vec3.fromValues(0, 0, 0);
        let cameraRot = this.camera.invertRotY;

        let frameDeceleration = this.velocity * this.deceleration;
        frameDeceleration = frameDeceleration * dt;
        frameDeceleration = Math.sign(frameDeceleration) * Math.min(Math.abs(frameDeceleration), Math.abs(this.velocity));

        this.velocity = this.velocity + frameDeceleration;
        this.velocity += this.acceleration * dt;

        if (this.input.forward)
        {
            forward[2] = -1;
        }

        if (this.input.right)
        {
            forward[0] = 1;
        }

        if (this.input.back)
        {
            forward[2] = 1;
        }

        if (this.input.left)
        {
            forward[0] = -1;
        }

        vec3.normalize(forward, forward);

        if (this.running)
        {
            vec3.scale(forward, forward, 2.5);
        }

        const inputRotAngle = Math.atan2(-forward[0], -forward[2]);
        const forwardLength = vec3.length(forward);

        if (forwardLength > 0)
        {
            this.object.model.rotation = quat.rotateY(quat.create(), cameraRot, inputRotAngle);

            vec3.transformQuat(forward, forward, cameraRot);
            vec3.scale(forward, forward, this.velocity * dt);
            this.object.model.translation = vec3.add(vec3.create(), this.object.model.translation, forward);
        }
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