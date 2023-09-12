import {GeometryAttribute} from "./GeometryAttribute";
import {AccessorData} from "../GLTF/Accessor";

export class Geometry
{
    static count = 0;

    public readonly id: number;
    public readonly attributes: GeometryAttribute[] = [];
    public updateBuffers: boolean = false;
    public count: number = 0;
    public index: AccessorData | null = null;

    constructor()
    {
        this.id = Geometry.count++;
    }

    public setAttribute(name: string, data: AccessorData, itemSize: number, normalized: boolean = false)
    {
        this.attributes.push(new GeometryAttribute(name, data, itemSize, normalized));

        this.updateBuffers = true;
    }

    public get indexed(): boolean
    {
        return this.index !== null;
    }
}