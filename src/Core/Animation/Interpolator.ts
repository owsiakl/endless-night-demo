import {quat, vec3} from "gl-matrix";
import {Interpolation} from "./Interpolation";

export class Interpolator
{
    public constructor(public interpolation: string)
    {
    }

    public translation(from: vec3, to: vec3, interpolationValue: number): vec3
    {
        if (this.interpolation === Interpolation.STEP) {
            return from;
        }

        if (this.interpolation === Interpolation.LINEAR) {
            return vec3.lerp(vec3.create(), from, to, interpolationValue);
        }

        if (this.interpolation === Interpolation.CUBICSPLINE) {
            throw new Error('Cubic spline translation interpolation is not yet implemented.');
        }

        throw new Error(`Translation interpolation "${this.interpolation}" unrecognized.`);
    }

    public rotation(from: quat, to: quat, interpolationValue: number): quat
    {
        if (this.interpolation === Interpolation.STEP) {
            return from;
        }

        if (this.interpolation === Interpolation.LINEAR) {
            return quat.slerp(quat.create(), from, to, interpolationValue);
        }

        if (this.interpolation === Interpolation.CUBICSPLINE) {
            throw new Error('Cubic spline rotation interpolation is not yet implemented.');
        }

        throw new Error(`Rotation interpolation "${this.interpolation}" unrecognized.`);
    }

    public scale(from: vec3, to: vec3, interpolationValue: number): vec3
    {
        if (this.interpolation === Interpolation.STEP) {
            return from;
        }

        if (this.interpolation === Interpolation.LINEAR) {
            return vec3.lerp(vec3.create(), from, to, interpolationValue);
        }

        if (this.interpolation === Interpolation.CUBICSPLINE) {
            throw new Error('Cubic spline scale interpolation is not yet implemented.');
        }

        throw new Error(`Scale interpolation "${this.interpolation}" unrecognized.`);
    }
}
