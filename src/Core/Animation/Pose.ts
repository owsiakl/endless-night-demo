import {Transform} from "../Transform";
import {mat4} from "gl-matrix";

export class Pose
{
    public _nodes: Array<Transform>;
    public _names: Array<string>;
    public _parents: Array<int>;

    public constructor()
    {
        this._nodes = [];
        this._names = [];
        this._parents = [];
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
}