import {Geometry} from "./Geometry";
import {Material} from "./Material";

export interface Object
{
    get geometry(): Geometry;
    get material(): Material;
}