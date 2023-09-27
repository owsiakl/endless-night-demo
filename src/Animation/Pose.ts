import {Transform} from "../Core/Transform";
import {quat, vec3} from "gl-matrix";

export class Pose
{
    public _nodes: Array<Transform>;
    public _names: Array<string>;

    public constructor(nodes: Array<Transform> = [], names: Array<string> = [])
    {
        this._nodes = nodes;
        this._names = names;
    }

    public apply(pose: Pose)
    {
        for (let i = 0; i < this._nodes.length; i++)
        {
            const from = pose._nodes[i];
            const to = this._nodes[i];

            to.translation = from.translation;
            to.rotation = from.rotation;
            to.scale = from.scale;
        }
    }

    public addNode(name: string, node: Transform) : void
    {
        this._nodes.push(node);
        this._names.push(name);
    }

    public getLocalTransform(index: int) : Transform
    {
        if (undefined === this._nodes[index])
        {
            throw new Error(`Cannot get global transform for index "${index}": undefined node.`);
        }

        return this._nodes[index];
    }

    public setLocalTransform(index: int, transform: Transform) : void
    {
        this._nodes[index] = transform;
    }

    public blendTo(pose2: Pose, value: float) : Pose
    {
        const outPose = this.copy;

        for (let i = 0; i < this._nodes.length; i++)
        {
            const transform1 = this._nodes[i];
            const transform2 = pose2._nodes[i];

            outPose._nodes[i] = new Transform(
                vec3.lerp(vec3.create(), transform1.translation, transform2.translation, value),
                quat.slerp(quat.create(), transform1.rotation, transform2.rotation, value),
                vec3.lerp(vec3.create(), transform1.scale, transform2.scale, value),
            );
        }

        return outPose;
    }

    public get copy() : Pose
    {
        return new Pose(
            this._nodes.map(n => n.copy()),
            this._names.map(n => n),
        );
    }
}