import {AnimationClip} from "./AnimationClip";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {Object3D} from "../Core/Object3D";
import {Skeleton} from "../Core/Skeleton";

export class AnimationControl
{
    private _clip: Nullable<AnimationClip>;
    private readonly _clips: {[name: string]: AnimationClip};
    private _time: Nullable<float>;
    private readonly _speed: float;
    private readonly _skeleton: Skeleton;

    private readonly _targets: AnimationClip[];
    private readonly _targetDuration;
    private _targetTime;
    private _targetParallel;
    private _targetAnimationTime: float;

    public constructor(skeleton: Skeleton)
    {
        this._clip = null;
        this._clips = {};
        this._time = null;
        this._speed = 1;
        this._skeleton = skeleton;

        this._targets = [];
        this._targetTime = 0.0;
        this._targetDuration = 0.3;
        this._targetParallel = false;
        this._targetAnimationTime = 0.0;
    }

    public addClip(name: string, clip: AnimationClip) : void
    {
        this._clips[name] = clip;
    }

    public play(name: string) : void
    {
        if (this._clip?.name === name)
        {
            return;
        }

        this._clip = this._clips[name];
        this._time = null;
    }

    public fadeTo(name: string, parallel: boolean = false) : void
    {
        this._targets.push(this._clips[name]);
        this._targetParallel = parallel;
    }

    public update(dt: float) : void
    {
        if (null === this._clip)
        {
            return;
        }

        if (null === this._time)
        {
            this._time = this._clip.startTime;
        }

        const elapsed = dt * this._speed;

        this._time += elapsed;

        if (this._time > this._clip.endTime)
        {
            this._time = Math.max(this._time % this._clip.duration, this._clip.startTime);
        }

        if (this._targets.length > 0)
        {
            const clip = this._targets[0];

            this._targetTime += elapsed;
            this._targetAnimationTime += elapsed;

            if (this._targetAnimationTime > clip.endTime)
            {
                this._targetAnimationTime = Math.max(this._time % clip.duration, clip.startTime);
            }

            if (this._targetParallel)
            {
                const normalizedDuration = this._time / this._clip.duration;

                this._targetAnimationTime = normalizedDuration * clip.duration;
            }
        }

        this._updateObject();
    }

    private _updateObject() : void
    {
        if (null === this._clip)
        {
            return;
        }

        if (null === this._time)
        {
            return;
        }

        let pose = this._clip.sample(this._skeleton.bindPose, this._time);

        if (this._targets.length > 0)
        {
            if (this._targetTime > this._targetDuration)
            {
                this._clip = this._targets.shift() as AnimationClip;
                this._time = this._targetAnimationTime;

                pose = this._clip.sample(this._skeleton.bindPose, this._targetAnimationTime);

                this._targetAnimationTime = 0;
                this._targetTime = 0;
                this._targetParallel = false;
            }
            else
            {
                const fadeTo = this._targets[0].sample(this._skeleton.bindPose, this._targetAnimationTime);
                const weight = this._targetTime / this._targetDuration;

                pose = pose.blendTo(fadeTo, weight);
            }
        }

        this._skeleton.currentPose.apply(pose);
    }
}