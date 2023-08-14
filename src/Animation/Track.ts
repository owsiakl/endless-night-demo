import {Frame} from "./Frame/Frame";
import {Interpolation} from "./Interpolation";

export class Track<Type>
{
    private readonly _frames: Array<Frame<Type>>;
    private readonly _interpolation: Interpolation;

    public constructor(frames: Array<Frame<Type>>, interpolation: Interpolation = Interpolation.LINEAR)
    {
        this._frames = frames;
        this._interpolation = interpolation;
    }

    public sample(time: float) : Type
    {
        const index = this.getFrameIndexAt(time);
        const frame = this._frames[index];
        const nextFrame = this._frames[index + 1];

        if (undefined === nextFrame)
        {
            throw new Error(`Can't sample track: next frame doesn't exists.`);
        }

        const value = (time - frame.time) / (nextFrame.time - frame.time);

        return frame.interpolate(nextFrame, value, this._interpolation);
    }

    public get startTime() : float
    {
        return this._frames.reduce((current, frame) => Math.min(current, frame.time), Infinity)
    }

    public get endTime() : float
    {
        return this._frames.reduce((current, frame) => Math.max(current, frame.time), 0)
    }

    private getFrameIndexAt(time: float) : int
    {
        for (let i = 0; i < this._frames.length; i++)
        {
            const frame = this._frames[i];

            if (frame.time >= time)
            {
                return Math.max(1, i) - 1;
            }
        }

        throw new Error(`Can't get current frame index at time "${time}": time is out of bounds.`);
    }
}