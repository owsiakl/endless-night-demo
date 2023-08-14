import {TransformTrack} from "./TransformTrack";
import {Pose} from "./Pose";

export class AnimationClip
{
    public tracks: Array<TransformTrack>;

    private readonly _loop: boolean;
    public readonly name: string;
    public startTime: float;
    public endTime: float;
    public duration: float;

    public constructor(name: string)
    {
        this.name = name;
        this._loop = true;
        this.tracks = [];
        this.startTime = Infinity;
        this.endTime = 0.0;
        this.duration = 0.0;
    }

    public sample(pose: Pose, time: float) : Pose
    {
        const outPose = pose.copy;

        for (let i = 0; i < this.tracks.length; i++)
        {
            const id = this.tracks[i].id;
            const local = outPose.getLocalTransform(id);
            const animated = this.tracks[i].sample(local, time);

            outPose.setLocalTransform(id, animated);
        }

        return outPose;
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