import {Channel} from "./Animation/Channel";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-animation
 */
export class Animation
{
    public constructor(public name: string, public channels: Array<Channel>)
    {
    }

    advance(time: number)
    {
        for (const channel of this.channels) {
            channel.advance(time);
        }
    }
}
