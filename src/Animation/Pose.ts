import {Transform} from "../Core/Transform";
import {mat4, quat, vec3} from "gl-matrix";

export class Pose
{
    public _nodes: Array<Transform>;
    public _names: Array<string>;
    public _parents: Array<int>;

    public constructor(nodes: Array<Transform> = [], names: Array<string> = [], parents: Array<int> = [])
    {
        this._nodes = nodes;
        this._names = names;
        this._parents = parents;
    }

    public addNode(name: string, node: Transform, parentId: int) : void
    {
        this._nodes.push(node);
        this._names.push(name);
        this._parents.push(parentId);
    }

    public getLocalTransform(index: int) : Transform
    {
        if (null === this._nodes[index])
        {
            throw new Error(`Cannot get global transform for index "${index}": null node.`);
        }

        return this._nodes[index]!;
    }

    public setLocalTransform(index: int, transform: Transform) : void
    {
        this._nodes[index] = transform;
    }

    public getGlobalTransform(index: int) : mat4
    {
        let result = this._nodes[index].matrix;

        for (let parent = this._parents[index]; parent >= -1; parent = this._parents[parent])
        {
            const parentNode = this._nodes[parent];

            if (undefined === parentNode)
            {
                continue;
            }

            mat4.multiply(result, parentNode.matrix, result);
        }

        return result;
    }

    public blend(pose1: Pose, pose2: Pose, value: float) : Pose
    {
        const outPose = pose1.copy;

        for (let i = 0; i < pose1._nodes.length; i++)
        {
            const transform1 = pose1._nodes[i];
            const transform2 = pose2._nodes[i];

            outPose._nodes[i] = new Transform(
                vec3.lerp(vec3.create(), transform1.translation, transform2.translation, value),
                quat.slerp(quat.create(), transform1.rotation, transform2.rotation, value),
                vec3.lerp(vec3.create(), transform1.scale, transform2.scale, value),
            );
        }

        return outPose;
    }

    public get matrixPalette() : Array<mat4>
    {
        const matrix: Array<mat4> = []

        let i = 0;

        for (; i < this._nodes.length; i++)
        {
            const parent = this._parents[i];

            if (parent > i)
            {
                break;
            }

            let global = this._nodes[i].matrix;

            if (parent >= 0)
            {
                global = mat4.multiply(mat4.create(), matrix[parent], global);
            }

            matrix[i] = global;
        }

        for (; i < this._nodes.length; i++)
        {
            matrix.push(this.getGlobalTransform(i));
        }

        return matrix;
    }

    public get copy() : Pose
    {
        return new Pose(
            this._nodes.map(n => n.copy()),
            this._names.map(n => n),
            this._parents.map(n => n)
        );
    }
}