import {AnimationClip} from "./AnimationClip";
import {Skeleton} from "../Core/Skeleton";

export class AnimationControl
{
    private _currentClip: Nullable<AnimationClip>;
    private readonly _clips: {[name: string]: AnimationClip};
    private _time: Nullable<float>;
    private readonly _speed: float;
    private readonly _skeleton: Skeleton;
    private readonly _fadeTargets: Array<AnimationClip>;
    private _fadeParallel: boolean;
    private _fadeTime: float;
    private readonly _fadeDuration: float;

    public constructor(skeleton: Skeleton)
    {
        this._currentClip = null;
        this._clips = {};
        this._time = null;
        this._speed = 1;
        this._skeleton = skeleton;

        this._fadeTargets = [];
        this._fadeParallel = false;
        this._fadeTime = 0.0;
        this._fadeDuration = 0.25;
    }

    public addClip(name: string, clip: AnimationClip) : void
    {
        this._clips[name] = clip;
    }

    public play(name: string) : void
    {
        if (this._currentClip?.name === name)
        {
            return;
        }

        this._currentClip = this._clips[name];
        this._time = null;
    }

    public fadeTo(name: string, parallel: boolean = false) : void
    {
        if (this._fadeTargets.length > 0)
        {
            this._fadeTargets[1] = this._clips[name];

            return;
        }

        this._fadeTargets.push(this._clips[name]);
        this._fadeParallel = parallel;
    }

    public update(dt: float) : void
    {
        if (null === this._currentClip)
        {
            return;
        }

        if (null === this._time)
        {
            this._time = this._currentClip.startTime;
        }

        const elapsed = dt * this._speed;

        this._time += elapsed;

        if (this._time > this._currentClip.endTime)
        {
            this._time = Math.max(this._time % this._currentClip.duration, this._currentClip.startTime);
        }

        let pose = this._currentClip.sample(this._skeleton.bindPose, this._time);

        if (this._fadeTargets.length > 0)
        {
            this._fadeTime += elapsed;

            const fadeTo = this._fadeTargets[0];
            let targetTime = this._fadeTime;

            if (this._fadeParallel)
            {
                const normalizedDuration = this._time / this._currentClip.duration;
                targetTime = normalizedDuration * fadeTo.duration;
            }

            if (this._fadeTime > this._fadeDuration)
            {
                this._currentClip = this._fadeTargets.shift()!;
                this._time = targetTime;
                this._fadeTime = 0;

                pose = this._currentClip.sample(this._skeleton.bindPose, targetTime);
            }
            else
            {
                const weight = this._fadeTime / this._fadeDuration;
                const blendTo = fadeTo.sample(this._skeleton.bindPose, targetTime);

                pose = pose.blendTo(blendTo, weight);
            }
        }

        this._skeleton.currentPose.apply(pose);
    }
}