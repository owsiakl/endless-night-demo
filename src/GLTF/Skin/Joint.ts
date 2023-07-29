import {mat4} from "gl-matrix";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-skin
 */
export class Joint
{
    public jointMatrix: mat4 = mat4.create();
    public ibm: mat4 = mat4.create();

    public constructor(public index: number)
    {

    }
}