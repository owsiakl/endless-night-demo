import {Geometry} from "../Geometry";
import {Material} from "../Material";
import {Mesh} from "./Mesh";
import {Skeleton} from "../Skeleton";

export class SkinnedMesh extends Mesh
{
    constructor(
        name: string,
        public readonly geometry: Geometry,
        public readonly material: Material,
        public readonly skeleton: Skeleton,
    ) {
        super(name, geometry, material);
    }
}