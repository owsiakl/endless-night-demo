import {mat4} from "gl-matrix";
import {Object3D} from "./Object3D";
import {Pose} from "../Animation/Pose";

export class Skeleton extends Object3D
{
    public readonly bindPose: Pose;
    public currentPose: Pose;

    private readonly _joints: Array<int>
    private readonly _names: Array<string>
    private readonly _parents: Array<int>
    private readonly _inverseBindPose: Array<mat4>

    public constructor(bindPose: Pose)
    {
        super();

        this.bindPose = bindPose;
        this.currentPose = bindPose;

        this._joints = [];
        this._names = [];
        this._parents = [];
        this._inverseBindPose = [];
    }

    public addJoint(name: string, joint: int, parentId: int, ibm: mat4) : void
    {
        this._joints.push(joint);
        this._names.push(name);
        this._parents.push(parentId);
        this._inverseBindPose.push(ibm);
    }

    public get jointMatrix() : mat4
    {
        const size = this._joints.length;
        const matrix = new Float32Array(size * 16);
        const globalTransforms = this.currentPose.matrixPalette;

        for (let i = 0; i < size; i++)
        {
            const jointId = this._joints[i];

            matrix.set(
                mat4.multiply(mat4.create(), globalTransforms[jointId], this._inverseBindPose[i]),
                i * 16
            );
        }

        return matrix;
    }
}