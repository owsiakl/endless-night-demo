import {Object3D} from "../Object3D";

export interface Keyframe
{
    get objectId(): number;
    get times(): number[];
    update(bone: Object3D, currentTime: number): void;
}