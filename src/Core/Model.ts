import {Object3D} from "./Object3D";
import {Skeleton} from "./Skeleton";
import {AnimationClip} from "../Animation/AnimationClip";

export interface Model
{
    get scene() : [Object3D, Nullable<Skeleton>, Nullable<Array<AnimationClip>>];
}