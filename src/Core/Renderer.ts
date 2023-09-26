import {Scene} from "../Core/Scene";
import {Camera} from "../Camera/Camera";

export interface Renderer
{
    render(scene: Scene, camera: Camera) : void;

    get canvas() : HTMLCanvasElement;
}