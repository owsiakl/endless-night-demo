import {Light} from "./Light";
import {mat4, vec3} from "gl-matrix";
import {Object3D} from "../Core/Object3D";

const ORTHOGRAPHIC_WIDTH = 2.0;
const ORTHOGRAPHIC_NEAR = 0;
const ORTHOGRAPHIC_FAR = 10;

const PERSPECTIVE_FOV = 60;
const PERSPECTIVE_WIDTH = 1;
const PERSPECTIVE_HEIGHT = 1;
const PERSPECTIVE_NEAR = 1;
const PERSPECTIVE_FAR = 30;

export class DirectionalLight extends Object3D implements Light
{
    private _currentTarget: vec3;
    private _followTarget: Nullable<Object3D>;
    private _previousFollowTargetPosition: Nullable<vec3>;
    private readonly _worldUp: vec3;

    private readonly _projectionMatrix: mat4;
    private readonly _viewMatrix: mat4;
    private readonly _projectionViewMatrix: mat4;

    private _projectionChanged = true;
    private _viewChanged = true;
    private _projectionViewChanged = true;

    constructor(target: vec3 = vec3.fromValues(0, 0, 0))
    {
        super();

        this._currentTarget = target;
        this._followTarget = null;
        this._previousFollowTargetPosition = null;
        this._worldUp = [0, 1, 0];

        this._projectionMatrix = mat4.create();
        this._viewMatrix = mat4.create();
        this._projectionViewMatrix = mat4.create();
    }

    public update(dt: float) : void
    {
        if (null === this._followTarget || null === this._previousFollowTargetPosition)
        {
            return;
        }

        const newTargetPosition = this._followTarget.translation;

        if (vec3.equals(this._previousFollowTargetPosition, newTargetPosition))
        {
            return;
        }

        this.translation = vec3.fromValues(newTargetPosition[0], 5, newTargetPosition[2] + 5);
        this._currentTarget = this._followTarget.translation;

        this._viewChanged = true;
        this._projectionViewChanged = true;
        this._previousFollowTargetPosition = newTargetPosition;
    }

    public follow(object: Object3D) : void
    {
        this._followTarget = object;
        this._previousFollowTargetPosition = object.translation;
    }

    public get projectionViewMatrix() : mat4
    {
        if (this._projectionViewChanged)
        {
            mat4.multiply(this._projectionViewMatrix, this.orthographicProjectionMatrix, this.viewMatrix);
            this._projectionViewChanged = false;
        }

        return this._projectionViewMatrix;
    }

    public get viewMatrix() : mat4
    {
        if (this._viewChanged)
        {
            mat4.lookAt(this._viewMatrix, this.translation, this._currentTarget, this._worldUp);
            this._viewChanged = false;
        }

        return this._viewMatrix;
    }

    public get perspectiveProjectionMatrix() : mat4
    {
        if (this._projectionChanged)
        {
            mat4.perspective(this._projectionMatrix, PERSPECTIVE_FOV * Math.PI / 180, PERSPECTIVE_WIDTH / PERSPECTIVE_HEIGHT, PERSPECTIVE_NEAR, PERSPECTIVE_FAR);
            this._projectionChanged = false;
        }

        return this._projectionMatrix;
    }

    public get orthographicProjectionMatrix() : mat4
    {
        if (this._projectionChanged)
        {
            mat4.ortho(this._projectionMatrix, -ORTHOGRAPHIC_WIDTH, ORTHOGRAPHIC_WIDTH, -ORTHOGRAPHIC_WIDTH, ORTHOGRAPHIC_WIDTH, ORTHOGRAPHIC_NEAR, ORTHOGRAPHIC_FAR);
            this._projectionChanged = false;
        }

        return this._projectionMatrix;
    }
}