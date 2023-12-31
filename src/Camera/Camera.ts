import {mat4, quat, vec3} from "gl-matrix";
import {Mouse} from "../Input/Mouse";
import {Object3D} from "../Core/Object3D";
import {CameraPosition} from "./CameraPosition";
import {Keyboard} from "../Input/Keyboard";

export class Camera
{
    public _fov = 45;
    public readonly _near = 0.1;
    public _far = 200;

    private readonly _zoomFactor = 0.01
    private readonly _zoomMin = 5.0;
    private readonly _zoomMax = 40.0;

    private readonly _rotateFactor = 0.01;

    private _width: int;
    private _height: int;
    private _mouseInput: Mouse;

    private _worldUp: vec3;
    public _position: vec3;
    public _target: vec3;
    private _direction: vec3;

    private _projectionMatrix: mat4;
    private _projectionChanged = true;

    private _viewMatrix: mat4;
    private _viewChanged = true;

    private _projectionViewMatrix: mat4;
    private _projectionViewChanged = true;

    private _followTarget: Nullable<Object3D>;
    private _previousTargetPosition: Nullable<vec3>;

    public screenPosition: Nullable<CameraPosition>;

    private _orbit = true;

    public constructor(canvas: HTMLCanvasElement, position: vec3, mouseInput: Mouse)
    {
        this._width = canvas.width;
        this._height = canvas.height;

        this._mouseInput = mouseInput;
        this._worldUp = vec3.fromValues(0, 1, 0);
        this._position = position;
        this._target = vec3.fromValues(0, 0, 0);

        this._projectionMatrix = mat4.create();
        this._viewMatrix = mat4.create();
        this._projectionViewMatrix = mat4.create();

        this._direction = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this._position, this._target));

        this._followTarget = null;
        this._previousTargetPosition = null;
        this.screenPosition = null;
    }

    public update(dt: float) : void
    {
        if (this._orbit)
        {
            vec3.rotateY(this._position, this._position, this._target, 0.1 * dt);
            this.calculateViewMatrix();
        }

        if (this._mouseInput._scrolling)
        {
            const move = vec3.create();

            vec3.scale(move, this._direction, this._mouseInput._wheelOffset * this._zoomFactor);
            const nextPosition = vec3.add(vec3.create(), this._position, move);
            const radius = vec3.length(vec3.subtract(vec3.create(), nextPosition, this._target));

            if (radius > this._zoomMin && radius < this._zoomMax)
            {
                vec3.scale(move, this._direction, this._mouseInput._wheelOffset * this._zoomFactor);
                this._position = nextPosition;
                vec3.normalize(this._direction, vec3.subtract(vec3.create(), this._position, this._target));

                this.calculateViewMatrix();
            }
        }

        if (this._mouseInput._clicked)
        {
            const rotationSpeed = -this._mouseInput._offsetX * this._rotateFactor;

            vec3.rotateY(this._position, this._position, this._target, rotationSpeed);

            this.calculateViewMatrix();
        }

        if (null !== this._followTarget && null !== this._previousTargetPosition)
        {
            const targetPosition = vec3.clone(this._followTarget.translation);
            targetPosition[1] = 1.3;

            const moveX = targetPosition[0] - this._previousTargetPosition[0];
            const moveZ = targetPosition[2] - this._previousTargetPosition[2];

            this._position[0] += moveX;
            this._position[2] += moveZ;
            this._target = targetPosition;
            this._previousTargetPosition = targetPosition;

            vec3.normalize(this._direction, vec3.subtract(vec3.create(), this._position, this._target));

            this.calculateViewMatrix();
        }
    }

    public follow(object: Object3D)
    {
        this._followTarget = object;
        this._previousTargetPosition = object.translation;
    }

    /**
     * @description direction with zeroed Y component.
     */
    public get flatDirection() : vec3
    {
        this._direction[1] = 0;

        return this._direction;
    }

    public get viewMatrix() : mat4
    {
        if (this._viewChanged)
        {
            mat4.lookAt(this._viewMatrix, this._position, this._target, this._worldUp);
            this._viewChanged = false;
        }

        return this._viewMatrix;
    }

    public get projectionMatrix() : mat4
    {
        if (this._projectionChanged)
        {
            mat4.perspective(this._projectionMatrix, this._fov, this._width / this._height, this._near, this._far);
            this._projectionChanged = false;
        }

        return this._projectionMatrix;
    }

    public get projectionViewMatrix() : mat4
    {
        if (this._projectionViewChanged)
        {
            mat4.multiply(this._projectionViewMatrix, this.projectionMatrix, this.viewMatrix);
            this._projectionViewChanged = false;
        }

        return this._projectionViewMatrix;
    }

    public calculateViewMatrix() : void
    {
        this._viewChanged = true;
        this._projectionViewChanged = true;
    }

    public calculateProjectionMatrix() : void
    {
        this._projectionChanged = true;
        this._projectionViewChanged = true;
    }

    public get rotY() : quat
    {
        const rotation = mat4.getRotation(quat.create(), this.viewMatrix);
        const theta = Math.atan2(rotation[1], rotation[3])

        return quat.fromValues(0, Math.sin(theta), 0, Math.cos(theta));
    }

    public get invertRotY() : quat
    {
        return quat.invert(quat.create(), this.rotY);
    }

    public get width() : float
    {
        return this._width;
    }

    public get height() : float
    {
        return this._height;
    }

    public stopOrbiting() : void
    {
        this._orbit = false;
    }

    public splitScreen(position: CameraPosition)
    {
        if (position === CameraPosition.TOP || position === CameraPosition.BOTTOM)
        {
            this._height /= 2;
            this.calculateProjectionMatrix();
        }

        if (position === CameraPosition.LEFT || position === CameraPosition.RIGHT)
        {
            this._width /= 2;
            this.calculateProjectionMatrix();
        }

        this.screenPosition = position;
    }
}