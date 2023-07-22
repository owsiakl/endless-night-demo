import {Camera} from "../Engine/Camera";

export interface Mesh
{
    preRender(camera: Camera): void;

    render(time: number, camera: Camera): void;
}