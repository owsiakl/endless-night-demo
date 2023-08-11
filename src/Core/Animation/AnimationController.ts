import {Clip} from "./Clip";
import {Object3D} from "../Object3D";
import {SkinnedMesh} from "../Object/SkinnedMesh";

export class AnimationController
{
    private _clip: Nullable<Clip>;
    private _time: Nullable<float>;
    private readonly _speed: float;
    private _model: Object3D;

    public constructor(model: Object3D)
    {
        this._clip = null;
        this._time = null;
        this._speed = 1;
        this._model = model;
    }

    public play(clip: Clip) : void
    {
        this._clip = clip;
    }

    public update(deltaTime: float) : void
    {
        if (null === this._clip)
        {
            return;
        }

        if (null === this._time)
        {
            this._time = this._clip.startTime;
        }

        const elapsed = deltaTime * this._speed;

        this._time += elapsed;

        if (this._time > this._clip.endTime)
        {
            this._time = Math.max(this._time % this._clip.duration, this._clip.startTime);
        }

        this._model.traverse(object => this._updateObject(object))
    }

    private _updateObject(object: Object3D) : void
    {
        if (!(object instanceof SkinnedMesh))
        {
            return;
        }

        if (null === this._clip)
        {
            return;
        }

        if (null === this._time)
        {
            return;
        }

        this._clip.sample(object.skeleton.currentPose, this._time);
    }
}