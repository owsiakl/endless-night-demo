import {Keyframe} from "./Keyframe";
import {Node} from "../Node";
import {Interpolator} from "./Interpolator";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-animation
 */
export class Channel
{
    public duration: number;
    public animationElapsed: number = 0;

    private constructor(
        public node: Node,
        public interpolation: string,
        public interpolator: Interpolator,
        public target: string,
        public keyframes: Array<Keyframe>,
        public minTime: number,
        public maxTime: number,
    ) {
        this.duration = maxTime - minTime;
    }

    public static create(keyframes: Array<Keyframe>, node: Node, interpolation: string|undefined, target: string) : Channel
    {
        return new this(
            node,
            interpolation ?? 'LINEAR',
            new Interpolator(interpolation ?? 'LINEAR'),
            target,
            keyframes,
            keyframes[0].time,
            keyframes[keyframes.length - 1].time
        );
    }

    advance(time: number)
    {
        const current = this.getCurrentKeyframe;
        const next = this.keyframes[current.index + 1];
        const interpolationValue = (this.animationElapsed - current.time) / (next.time - current.time);

        switch (this.target) {
            case 'translation':
                this.node.translation = this.interpolator.translation(current, next, interpolationValue);
                break;

            case 'rotation':
                this.node.rotation = this.interpolator.rotation(current, next, interpolationValue);
                break;

            case 'scale':
                this.node.scale = this.interpolator.scale(current, next, interpolationValue);
                break;

            default:
                throw new Error(`Unrecognized channel target "${this.target}".`);
        }

        if (this.animationElapsed + time >= this.duration) {
            this.animationElapsed = 0;
        } else {
            this.animationElapsed += time;
        }
    }

    public get getCurrentKeyframe(): Keyframe
    {
        return this.keyframes[Math.max(1, this.keyframes.findIndex(k => k.time > this.animationElapsed)) - 1];
    }
}
