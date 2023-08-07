import {Geometry} from "../Geometry";
import {Material} from "../Material";
import {Mesh} from "./Mesh";
import {Skeleton} from "../Skeleton";

export class SkinnedMesh extends Mesh
{
    public skeleton: Skeleton|null = null

    constructor(
        id: number,
        name: string,
        public readonly geometry: Geometry,
        public readonly material: Material
    ) {
        super(id, name, geometry, material);
    }
}