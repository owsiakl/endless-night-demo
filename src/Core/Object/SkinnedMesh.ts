import {Geometry} from "../Geometry";
import {Material} from "../Material";
import {Mesh} from "./Mesh";
import {Skeleton} from "../Skeleton";

export class SkinnedMesh extends Mesh
{
    public readonly geometry: Geometry;
    public readonly material: Material;

    private _skeleton: Nullable<Skeleton>;

    constructor(geometry: Geometry, material: Material)
    {
        super(geometry, material);

        this.geometry = geometry;
        this.material = material;
        this._skeleton = null;
    }

    set skeleton(skeleton: Skeleton)
    {
        this._skeleton = skeleton;
    }

    get skeleton() : Skeleton
    {
        if (null === this._skeleton)
        {
            throw new Error(`Skeleton for a mesh wasn't assigned yet.`);
        }

        return this._skeleton;
    }
}