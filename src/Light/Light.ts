import {mat4} from "gl-matrix";
import { Object3D } from "../Core/Object3D";

export interface Light extends Object3D
{
    update(dt: float) : void;
    get projectionViewMatrix() : mat4;
}