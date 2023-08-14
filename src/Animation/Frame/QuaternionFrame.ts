import {quat} from "gl-matrix";
import {Frame} from "./Frame";
import {Interpolation} from "../Interpolation";

export class QuaternionFrame implements Frame<quat>
{
    public readonly time: float;
    public readonly value: quat;

    public constructor(time: float, value: quat)
    {
        this.time = time;
        this.value = value;
    }

    interpolate(to: QuaternionFrame, interpolationValue: float, interpolation: Interpolation) : quat
    {
        if (interpolation === Interpolation.STEP)
        {
            return this.value;
        }

        if (interpolation === Interpolation.LINEAR)
        {
            return quat.slerp(quat.create(), this.value, to.value, interpolationValue);
        }

        if (interpolation === Interpolation.CUBICSPLINE)
        {
            throw new Error('Cubic spline quaternion interpolation is not implemented.');
        }

        throw new Error(`Unrecognized quaternion interpolation: "${interpolation}".`);
    }
}