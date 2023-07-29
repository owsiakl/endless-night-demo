import {Keyframe} from "./Keyframe";
import {quat, vec3} from "gl-matrix";
import {Interpolation} from "./Interpolation";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-animation
 */
export class Interpolator
{
    public constructor(public interpolation: string)
    {
    }

    public translation(keyframe1: Keyframe, keyframe2: Keyframe, interpolationValue: number): vec3
    {
        if (undefined === keyframe1.translation || undefined === keyframe2.translation) {
            throw new Error(`Can't interpolate translation as one of the keyframes translation is undefined.`);
        }

        if (this.interpolation === Interpolation.STEP) {
            return keyframe1.translation;
        }

        if (this.interpolation === Interpolation.LINEAR) {
            return vec3.lerp(vec3.create(), keyframe1.translation, keyframe2.translation, interpolationValue);
        }

        if (this.interpolation === Interpolation.CUBICSPLINE) {
            throw new Error('Cubic spline translation interpolation is not yet implemented.');
        }

        return vec3.create();
    }

    public rotation(keyframe1: Keyframe, keyframe2: Keyframe, interpolationValue: number): quat
    {
        if (undefined === keyframe1.rotation || undefined === keyframe2.rotation) {
            throw new Error(`Can't interpolate rotation as one of the keyframes rotation is undefined.`);
        }

        if (this.interpolation === Interpolation.STEP) {
            return keyframe1.rotation;
        }

        if (this.interpolation === Interpolation.LINEAR) {
            return quat.slerp(quat.create(), keyframe1.rotation, keyframe2.rotation, interpolationValue);
        }

        if (this.interpolation === Interpolation.CUBICSPLINE) {
            throw new Error('Cubic spline rotation interpolation is not yet implemented.');
        }

        return quat.create();
    }

    public scale(keyframe1: Keyframe, keyframe2: Keyframe, interpolationValue: number): vec3
    {
        if (undefined === keyframe1.scale || undefined === keyframe2.scale) {
            throw new Error(`Can't interpolate scale as one of the keyframes scale is undefined.`);
        }

        if (this.interpolation === Interpolation.STEP) {
            return keyframe1.scale;
        }

        if (this.interpolation === Interpolation.LINEAR) {
            return vec3.lerp(vec3.create(), keyframe1.scale, keyframe2.scale, interpolationValue);
        }

        if (this.interpolation === Interpolation.CUBICSPLINE) {
            throw new Error('Cubic spline scale interpolation is not yet implemented.');
        }

        return vec3.create();
    }
}
