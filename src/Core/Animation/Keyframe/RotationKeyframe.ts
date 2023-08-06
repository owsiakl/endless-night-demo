import {quat, vec3} from "gl-matrix";
import {Keyframe} from "../Keyframe";
import {Object3D} from "../../Object3D";
import {Interpolator} from "../Interpolator";

export class RotationKeyframe implements Keyframe
{
    public constructor(
        public readonly objectId: number,
        public readonly times: number[],
        public readonly data: quat[],
        public readonly interpolator: Interpolator,
    ) {
    }

    public update(bone: Object3D, currentTime: number)
    {
        const currentIndex = this.getCurrentIndex(currentTime)
        const interpolationValue = (currentTime - this.times[currentIndex]) / (this.times[currentIndex + 1] - this.times[currentIndex]);

        bone.setRotation(this.interpolator.rotation(this.data[currentIndex], this.data[currentIndex + 1], interpolationValue));
    }

    public getCurrentIndex(currentTime: number): number
    {
        return Math.max(1, this.times.findIndex(k => k > currentTime)) - 1;
    }
}