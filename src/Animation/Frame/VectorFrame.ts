import {vec3} from "gl-matrix";
import {Frame} from "./Frame";
import {Interpolation} from "../Interpolation";

export class VectorFrame implements Frame<vec3>
{
    public readonly time: float;
    public readonly value: vec3;

    public constructor(time: float, value: vec3)
    {
        this.time = time;
        this.value = value;
    }

    interpolate(to: VectorFrame, interpolationValue: float, interpolation: Interpolation) : vec3
    {
        if (interpolation === Interpolation.STEP)
        {
            return this.value;
        }

        if (interpolation === Interpolation.LINEAR)
        {
            return vec3.lerp(vec3.create(), this.value, to.value, interpolationValue);
        }

        if (interpolation === Interpolation.CUBICSPLINE)
        {
            throw new Error('Cubic spline vector interpolation is not implemented.');
        }

        throw new Error(`Unrecognized vector interpolation: "${interpolation}".`);
    }
}