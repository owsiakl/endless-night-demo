import {mat4} from "gl-matrix";
import {Pose} from "../Animation/Pose";
import {Bone} from "./Object/Bone";

export class Skeleton
{
    public readonly bindPose: Pose;
    public readonly currentPose: Pose;

    private readonly _joints: Array<Bone>;
    private readonly _inverseBindPose: Array<mat4>;

    public constructor(bindPose: Pose)
    {
        this.bindPose = bindPose.copy;
        this.currentPose = bindPose;

        this._joints = [];
        this._inverseBindPose = [];
    }

    public getBone(index: int) : Bone
    {
        return this._joints[index];
    }

    public addJoint(joint: Bone, ibm: mat4) : void
    {
        this._joints.push(joint);
        this._inverseBindPose.push(ibm);
    }

    public get jointMatrix() : Float32Array
    {
        const size = this._joints.length;
        const matrix = new Float32Array(size * 16);

        for (let i = 0; i < size; i++)
        {
            matrix.set(
                mat4.multiply(mat4.create(), this._joints[i].boneTransform, this._inverseBindPose[i]),
                i * 16
            );
        }

        return matrix;
    }

    public get jointCount() : int
    {
        return this._joints.length
    }
}