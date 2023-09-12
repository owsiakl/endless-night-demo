import {Light} from "./Light";
import {mat4} from "gl-matrix";
import {Object3D} from "../Core/Object3D";

export class NullLight extends Object3D implements Light
{
    update(dt: float) : void
    {
    }

    get projectionViewMatrix() : mat4
    {
        return mat4.create();
    }
}