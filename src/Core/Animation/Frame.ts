import {Interpolation} from "./Interpolation";

export interface Frame<Type>
{
    interpolate(to: this, interpolationValue: float, interpolation: Interpolation) : Type;

    get time() : float;

    get value() : Type;
}