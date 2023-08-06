import {Keyframe} from "./Keyframe";
import {Skeleton} from "../Skeleton";

export class AnimationClip
{
    private readonly duration: number;
    private readonly speed: number = 0.1;
    private animationElapsed: number = 0;

    constructor(
        private readonly name: string,
        public readonly keyframes: Keyframe[],
    ) {
        this.duration = this.resetDuration();
    }

    public update(deltaTime: number, skeleton: Skeleton)
    {
        for (let i = 0, length = this.keyframes.length; i < length; i++)
        {
            const keyframe = this.keyframes[i];

            keyframe.update(skeleton.getBone(keyframe.objectId), this.animationElapsed);
        }

        const elapsed = deltaTime * this.speed;

        if (this.animationElapsed + elapsed >= this.duration) {
            this.animationElapsed = 0;
        } else {
            this.animationElapsed += elapsed;
        }
    }

    private resetDuration() : number
    {
        const tracks = this.keyframes;
        let duration = 0;

        for ( let i = 0, n = tracks.length; i !== n; ++ i )
        {
            const track = tracks[i];
            duration = Math.max( duration, track.times[ track.times.length - 1 ] );
        }

        return duration;
    }
}