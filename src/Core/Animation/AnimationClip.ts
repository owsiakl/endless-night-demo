import {Keyframe} from "./Keyframe";
import {Skeleton} from "../Skeleton";

export class AnimationClip
{
    private readonly duration: number;
    private readonly startTime: number;
    private readonly endTime: number;

    private readonly speed: number = 1;
    private animationElapsed: number = 0;

    constructor(
        private readonly name: string,
        public readonly keyframes: Keyframe[],
    ) {
        this.startTime = keyframes.reduce(
            (current, keyframe) => {
                return Math.min(
                    current,
                    keyframe.times.reduce((current, time) => Math.min(current, time), Infinity)
                );
            },
            Infinity
        );
        this.endTime = keyframes.reduce(
            (current, keyframe) => {
                return Math.max(
                    current,
                    keyframe.times.reduce((current, time) => Math.max(current, time), 0)
                );
            },
            0
        );
        this.duration = this.endTime - this.startTime;
    }

    public update(deltaTime: number, skeleton: Skeleton)
    {
        const elapsed = deltaTime * this.speed;

        this.animationElapsed += elapsed;

        if (this.animationElapsed > this.endTime)
        {
            this.animationElapsed = Math.max(this.animationElapsed % this.duration, this.startTime);
        }

        for (let i = 0, length = this.keyframes.length; i < length; i++)
        {
            const keyframe = this.keyframes[i];

            keyframe.update(skeleton.getBone(keyframe.objectId), this.animationElapsed);
        }
    }
}