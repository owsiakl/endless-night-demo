import {quat, vec3} from "gl-matrix";

export class Keyframe
{
    public index: number;
    public time: number;
    public translation: vec3 | undefined = undefined;
    public rotation: quat | undefined = undefined;
    public scale: vec3 | undefined = undefined;

    private constructor(index: number, time: number)
    {
        this.index = index;
        this.time = time;
    }

    public static translation(index: number, time: number, translation: vec3): Keyframe
    {
        const self = new this(index, time);
        self.translation = translation;

        return self;
    }

    public static rotation(index: number, time: number, rotation: quat): Keyframe
    {
        const self = new this(index, time);
        self.rotation = rotation;

        return self;
    }

    public static scale(index: number, time: number, scale: vec3): Keyframe
    {
        const self = new this(index, time);
        self.scale = scale;

        return self;
    }
}