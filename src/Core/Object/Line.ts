import {Geometry} from "../Geometry";
import {Material} from "../Material/Material";
import {Object3D} from "../Object3D";

export class Line extends Object3D
{
    constructor(
        public readonly geometry: Geometry,
        public readonly material: Material
    ) {
        super();
    }
}