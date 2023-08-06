import {Geometry} from "../Geometry";
import {Material} from "../Material";
import {Object3D} from "../Object3D";

export class Mesh extends Object3D
{
    constructor(
        name: string,
        public readonly geometry: Geometry,
        public readonly material: Material
    ) {
        super(0, name);
    }
}