import {quat, vec3} from "gl-matrix";
import {Accessor} from "./Accessor";
import {AnimationClip} from "../../Animation/AnimationClip";
import {Interpolation} from "../../Animation/Interpolation";
import {TransformTrack} from "../../Animation/TransformTrack";
import {VectorFrame} from "../../Animation/Frame/VectorFrame";
import {Track} from "../../Animation/Track";
import {QuaternionFrame} from "../../Animation/Frame/QuaternionFrame";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-animation
 */
export class Animation
{
    public static fromJson(animation: khr_gltf_animation, index: int, accessors: Array<Accessor>) : AnimationClip
    {
        const name = animation.name ?? `animation_${index}`;
        const clip = new AnimationClip(name);

        for (let c = 0; c < animation.channels.length; c++)
        {
            const channel = animation.channels[c];
            const nodeId = channel.target.node;
            const path = channel.target.path;
            const sampler = animation.samplers[channel.sampler];
            const times = accessors[sampler.input].data;
            const values = accessors[sampler.output].data;

            if (undefined === nodeId)
            {
                /**
                 * invalid file - channel isn't referring to any node.
                 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-animation-channel-target
                 */

                continue;
            }

            let interpolation = Interpolation.LINEAR;

            if ('STEP' === sampler.interpolation)
            {
                interpolation = Interpolation.STEP;
            }

            if ('CUBICSPLINE' === sampler.interpolation)
            {
                throw new Error('GLTF: cubic spline interpolation is not implemented.');
            }

            const transformTrack = new TransformTrack(nodeId);
            const size = values.length / times.length;

            if ('translation' === path)
            {
                const frames = [];

                for (let t = 0; t < times.length; t++)
                {
                    frames.push(new VectorFrame(times[t], values.slice(t * size, (t * size) + size) as vec3))
                }

                transformTrack.translation = new Track<vec3>(frames, interpolation);
            }

            if ('rotation' === path)
            {
                const frames = [];

                for (let t = 0; t < times.length; t++)
                {
                    frames.push(new QuaternionFrame(times[t], values.slice(t * size, (t * size) + size) as quat))
                }

                transformTrack.rotation = new Track<quat>(frames, interpolation);
            }

            if ('scale' === path)
            {
                const frames = [];

                for (let t = 0; t < times.length; t++)
                {
                    frames.push(new VectorFrame(times[t], values.slice(t * size, (t * size) + size) as vec3))
                }

                transformTrack.scale = new Track<vec3>(frames, interpolation);
            }

            clip.tracks.push(transformTrack);
        }

        clip.recalculateDuration();

        return clip;
    }
}