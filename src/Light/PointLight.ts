import {Light} from "./Light";
import {mat4, vec3} from "gl-matrix";
import {Object3D} from "../Core/Object3D";

export class PointLight extends Object3D implements Light
{
    private readonly _directions: Array<{ target: vec3, up: vec3 }> = [];
    private _intensity: float;

    constructor()
    {
        super();

        this._intensity = 1.0;
        this._directions = [
            { target: vec3.fromValues(1, 0, 0), up: vec3.fromValues(0, -1, 0) },
            { target: vec3.fromValues(-1, 0, 0), up: vec3.fromValues(0, -1, 0) },
            { target: vec3.fromValues(0, 1, 0), up: vec3.fromValues(0, 0, 1) },
            { target: vec3.fromValues(0, -1, 0), up: vec3.fromValues(0, 0, -1) },
            { target: vec3.fromValues(0, 0, 1), up: vec3.fromValues(0, -1, 0) },
            { target: vec3.fromValues(0, 0, -1), up: vec3.fromValues(0, -1, 0) },
        ];
    }

    public update(dt: float) : void
    {
    }

    get projectionViewMatrix() : mat4
    {
        return mat4.create();
    }

    get faces() : int
    {
        return this._directions.length;
    }

    public get intensity() : float
    {
        return this._intensity;
    }

    public set intensity(value: float)
    {
        this._intensity = value;
    }

    getFaceProjectionViewMatrix(index: int) : mat4
    {
        const view = mat4.lookAt(
            mat4.create(),
            this.worldTranslation,
            vec3.add(vec3.create(), this.worldTranslation, this._directions[index].target),
            this._directions[index].up
        );

        const projection = mat4.perspective(
            mat4.create(),
            Math.PI / 2,
            1,
            0.1,
            20
        );

        return mat4.multiply(mat4.create(), projection, view);
    }
}