import {quat, vec3} from "gl-matrix";
import {Track} from "./Track";
import {Transform} from "../Core/Transform";

export class TransformTrack
{
    public readonly id: int;
    public translation: Nullable<Track<vec3>> = null;
    public rotation: Nullable<Track<quat>> = null;
    public scale: Nullable<Track<vec3>> = null;

    public constructor(id: int)
    {
        this.id = id;
    }

    public sample(transform: Transform, time: float) : Transform
    {
        if (null !== this.translation)
        {
            transform.translation = this.translation.sample(time);
        }

        if (null !== this.rotation)
        {
            transform.rotation = this.rotation.sample(time);
        }

        if (null !== this.scale)
        {
            transform.scale = this.scale.sample(time);
        }

        return transform;
    }

    public get startTime() : float
    {
        let time = Infinity;

        if (null !== this.translation)
        {
            time = Math.min(time, this.translation.startTime);
        }

        if (null !== this.rotation)
        {
            time = Math.min(time, this.rotation.startTime);
        }

        if (null !== this.scale)
        {
            time =  Math.min(time, this.scale.startTime);
        }

        if (time === Infinity)
        {
            throw new Error('Cannot calculate start time: no available tracks.');
        }

        return time;
    }

    public get endTime() : float
    {
        let time = 0;

        if (null !== this.translation)
        {
            time = Math.max(time, this.translation.endTime);
        }

        if (null !== this.rotation)
        {
            time = Math.max(time, this.rotation.endTime);
        }

        if (null !== this.scale)
        {
            time = Math.max(time, this.scale.endTime);
        }

        if (time === 0)
        {
            throw new Error('Cannot calculate end time: no available tracks.');
        }

        return time;
    }
}