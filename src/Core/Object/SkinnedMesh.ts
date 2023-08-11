import {Geometry} from "../Geometry";
import {Material} from "../Material";
import {Mesh} from "./Mesh";
import {Skeleton} from "../Skeleton";

export class SkinnedMesh extends Mesh
{
    public readonly geometry: Geometry;
    public readonly material: Material;
    public readonly skeleton: Skeleton;

    constructor(geometry: Geometry, material: Material, skeleton: Skeleton)
    {
        super(geometry, material);

        this.geometry = geometry;
        this.material = material;
        this.skeleton = skeleton;
    }
}