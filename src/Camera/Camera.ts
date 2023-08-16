import {vec3, mat4, quat} from "gl-matrix";

export abstract class Camera
{
    public _fov = 45;
    private readonly _near = 0.1;
    private readonly _far = 1000;

    private _canvas: HTMLCanvasElement;

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

    protected constructor(canvas: HTMLCanvasElement, position: vec3)
    {
        this._canvas = canvas;
        this._worldUp = vec3.fromValues(0, 1, 0);
        this._position = position;
        this._target = vec3.fromValues(0, 0, 0);

        this._projectionMatrix = mat4.create();
        this._viewMatrix = mat4.create();
        this._projectionViewMatrix = mat4.create();

        this._direction = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this._position, this._target));
        const _right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this._worldUp, this._direction));
        const _up = vec3.cross(vec3.create(), this._direction, _right);
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
            mat4.perspective(this._projectionMatrix, this._fov, this._canvas.width / this._canvas.height, this._near, this._far);
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

    public get invertRotY() : quat
    {
        const rotation = mat4.getRotation(quat.create(), this.viewMatrix);
        const theta = Math.atan2(rotation[1], rotation[3])
        const rotY = quat.fromValues(0, Math.sin(theta), 0, Math.cos(theta));

        return quat.invert(quat.create(), rotY);
    }
}