import {mat4, quat, vec3} from "gl-matrix";

export class Transform
{
    private _translation: vec3;
    private _rotation: quat;
    private _scale: vec3;

    private _matrix: mat4;
    private _calculateMatrix: boolean = false;

    public constructor(translation: vec3, rotation: quat, scale: vec3)
    {
        this._translation = translation;
        this._rotation = rotation;
        this._scale = scale;
        this._matrix = mat4.fromRotationTranslationScale(mat4.create(), rotation, translation, scale);
    }

    public static init() : Transform
    {
        return new this(
            vec3.fromValues(0, 0, 0),
            quat.fromValues(0, 0, 0, 1),
            vec3.fromValues(1, 1, 1)
        );
    }

    public copy() : Transform
    {
        return new Transform(
            vec3.fromValues(this._translation[0], this._translation[1], this._translation[2]),
            quat.fromValues(this._rotation[0], this._rotation[1], this._rotation[2], this._rotation[3]),
            vec3.fromValues(this._scale[0], this._scale[1], this._scale[2]),
        );
    }

    public static fromMatrix(matrix: mat4) : Transform
    {
        return new this(
            mat4.getTranslation(vec3.create(), matrix),
            mat4.getRotation(quat.create(), matrix),
            mat4.getScaling(vec3.create(), matrix)
        );
    }

    public set translation(translation: vec3)
    {
        this._translation = translation;
        this._calculateMatrix = true;
    }

    public get translation() : vec3
    {
        return this._translation;
    }

    public set rotation(rotation: quat)
    {
        this._rotation = rotation;
        this._calculateMatrix = true;
    }

    public get rotation() : quat
    {
        return this._rotation;
    }

    public set scale(scale: vec3)
    {
        this._scale = scale;
        this._calculateMatrix = true;
    }

    public get scale() : vec3
    {
        return this._scale;
    }

    public get matrix() : mat4
    {
        if (this._calculateMatrix)
        {
            this._matrix = mat4.fromRotationTranslationScale(mat4.create(), this._rotation, this._translation, this._scale);
            this._calculateMatrix = false;
        }

        return this._matrix;
    }
}