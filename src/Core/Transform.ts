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

    public static fromMatrix(matrix: mat4) : Transform
    {
        return new this(
            mat4.getTranslation(vec3.create(), matrix),
            mat4.getRotation(quat.create(), matrix),
            mat4.getScaling(vec3.create(), matrix)
        );
    }

    public multiply(other: Transform) : Transform
    {

         return Transform.fromMatrix(mat4.multiply(mat4.create(), this.matrix, other.matrix));

        // const transform = Transform.init();
        //
        // transform.translation = vec3.multiply(vec3.create(), this._translation, other._translation);
        // transform.rotation = quat.multiply(quat.create(), this._rotation, other._rotation);
        // transform.scale = vec3.multiply(vec3.create(), this._scale, other._scale);
        //
        // return transform;
    }

    public inverse() : Transform
    {
        return Transform.fromMatrix(mat4.invert(mat4.create(), this.matrix));
    }

    public set translation(translation: vec3)
    {
        this._translation = translation;
        this._calculateMatrix = true;
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
        }

        return this._matrix;
    }
}