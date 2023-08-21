import {mat4} from "gl-matrix";

export interface Light
{
    update(dt: float) : void;
    get projectionViewMatrix() : mat4;
}