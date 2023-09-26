import {Camera} from "../Camera/Camera";
import {Scene} from "./Scene";

export interface Renderer
{
    render(scene: Scene, camera: Camera) : void;

    get canvas() : HTMLCanvasElement;
}