import {Geometry} from "../Geometry";
import {Object} from "../Object";
import {Material} from "../Material";

export class Line implements Object
{
    constructor(
        public readonly geometry: Geometry,
        public readonly material: Material
    ) {
    }
}