import {Geometry} from "../Geometry";
import {Material} from "../Material/Material";
import {Object3D} from "../Object3D";

export class Point extends Object3D
{
    public readonly geometry: Geometry;
    public readonly material: Material;

    constructor(geometry: Geometry, material: Material)
    {
        super();

        this.geometry = geometry;
        this.material = material;
    }
}