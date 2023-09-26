import {GeometryAttribute} from "./GeometryAttribute";

export class Geometry
{
    static count = 0;

    public readonly id: number;
    public readonly attributes: GeometryAttribute[] = [];
    public updateBuffers: boolean = false;
    public count: number = 0;
    public index: Nullable<TypedArray> = null;

    constructor()
    {
        this.id = Geometry.count++;
    }

    public setAttribute(name: string, data: TypedArray, itemSize: number, normalized: boolean = false)
    {
        this.attributes.push(new GeometryAttribute(name, data, itemSize, normalized));

        this.updateBuffers = true;
    }

    public setEmptyAttribute(name: string, itemSize: number, normalized: boolean = false)
    {
        this.attributes.push(new GeometryAttribute(name, new Float32Array(), itemSize, normalized));

        this.updateBuffers = true;
    }

    public get indexed(): boolean
    {
        return this.index !== null;
    }

    public get attributesLength() : int
    {
        let length = 0;

        for (let i = 0; i < this.attributes.length; i++)
        {
            length += this.attributes[i].itemSize;
        }

        return length;
    }
}