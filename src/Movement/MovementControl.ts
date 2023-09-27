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
    public readonly animations: AnimationControl;

    private readonly _object: Object3D;
    private readonly _input: Keyboard;
    private readonly _camera: Camera;

    private readonly _acceleration = 7.0;
    private readonly _deceleration = -4.0;
    private _velocity = 0.0;

    private readonly _rotationTime = 0.5;
    private _currentRotationTime = 0.0;
    private _previousAngle = 0.0;

    private constructor(object: Object3D, animations: AnimationControl, input: Keyboard, camera: Camera)
    {
        super();

        this.animations = animations;
        this._object = object;
        this._input = input;
        this._camera = camera;
    }

    public static bind(object: Object3D, animations: AnimationControl, input: Keyboard, camera: Camera) : MovementControl
    {
        const self = new MovementControl(object, animations, input, camera);

        self.addState('idle', new IdleState(self));
        self.addState('walk', new WalkState(self));
        self.addState('run', new RunState(self));

        self.setState('idle');

        return self;
    }

    update(dt: float)
    {
        super.update(dt);

        this.animations.update(dt);

        if (!this.moving)
        {
            this._velocity = 0;

            return;
        }

        const forward = vec3.fromValues(0, 0, 1);
        const rotationDirection = vec3.fromValues(0, 0, 0);
        const cameraRot = this._camera.invertRotY;

        let frameDeceleration = this._velocity * this._deceleration;
        frameDeceleration = frameDeceleration * dt;
        frameDeceleration = Math.sign(frameDeceleration) * Math.min(Math.abs(frameDeceleration), Math.abs(this._velocity));

        this._velocity = this._velocity + frameDeceleration;
        this._velocity += this._acceleration * dt;

        if (this._input.forward)
        {
            rotationDirection[2] = -1;
        }

        if (this._input.right)
        {
            rotationDirection[0] = 1;
        }

        if (this._input.back)
        {
            rotationDirection[2] = 1;
        }

        if (this._input.left)
        {
            rotationDirection[0] = -1;
        }

        const currentRotation = quat.rotateY(quat.create(), cameraRot, Math.atan2(rotationDirection[0], rotationDirection[2]));
        const angle = quat.getAxisAngle(vec3.fromValues(0, 1, 0), currentRotation);

        if (angle !== this._previousAngle)
        {
            // start new rotation
            this._currentRotationTime = 0.0;
            this._previousAngle = angle;
        }

        if (!quat.equals(this._object.rotation, currentRotation))
        {
            this._currentRotationTime += dt;
            quat.slerp(this._object.rotation, this._object.rotation, currentRotation, this._currentRotationTime / this._rotationTime);


            if (this._currentRotationTime >= this._rotationTime)
            {
                this._object.rotation = currentRotation;
            }
        }

        if (this.running)
        {
            vec3.scale(forward, forward, 2.8);
        }

        vec3.transformQuat(forward, forward, this._object.rotation);
        vec3.scale(forward, forward, this._velocity * dt);
        this._object.translation = vec3.add(vec3.create(), this._object.translation, forward);
    }

    public get moving() : boolean
    {
        return this._input.forward || this._input.right || this._input.back || this._input.left;
    }

    public get running() : boolean
    {
        return this._input.shift;
    }
}