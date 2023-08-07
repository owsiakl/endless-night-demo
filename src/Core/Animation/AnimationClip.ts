import {Keyframe} from "./Keyframe";
import {Skeleton} from "../Skeleton";
import {Object3D} from "../Object3D";

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

    public update(deltaTime: number, root: Object3D)
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
            let object = null;

            root.traverse((child) => {
                if (keyframe.objectId === child.id)
                {
                    object = child;

                    return true;
                }

                return false;
            })

            if (null === object)
            {
                throw new Error(`Root model doesn't have object with id "${keyframe.objectId}".`);
            }

            keyframe.update(object, this.animationElapsed);
        }
    }
}