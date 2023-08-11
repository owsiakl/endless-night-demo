import {TransformTrack} from "./TransformTrack";
import {Pose} from "./Pose";

export class Clip
{
    public tracks: Array<TransformTrack>;

    private readonly _name: string;
    private readonly _loop: boolean;

    public startTime: float;
    public endTime: float;
    public duration: float;

    public constructor(name: string)
    {
        this._name = name;
        this._loop = true;
        this.tracks = [];
        this.startTime = Infinity;
        this.endTime = 0.0;
        this.duration = 0.0;
    }

    public sample(pose: Pose, time: float) : void
    {
        for (let i = 0; i < this.tracks.length; i++)
        {
            const id = this.tracks[i].id;
            const local = pose.getLocalTransform(id);
            const animated = this.tracks[i].sample(local, time);

            pose.setLocalTransform(id, animated);
        }
    }

    public recalculateDuration() : void
    {
        for (let i = 0; i < this.tracks.length; i++)
        {
            this.startTime = Math.min(this.startTime, this.tracks[i].startTime);
            this.endTime = Math.max(this.endTime, this.tracks[i].endTime);
        }

        this.duration = this.endTime - this.startTime;
    }
}