import {mat4} from "gl-matrix";
import {Joint} from "./Skin/Joint";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-skin
 */
export class Skin
{
    private constructor(public inverseBindMatrices: number, public joints: Array<Joint>)
    {
    }

    public static fromJson(skin: GLTF_skin): Skin
    {
        return new this(skin.inverseBindMatrices, skin.joints.map(joint => new Joint(joint)));
    }

    public get jointMatrix(): mat4
    {
        const size = this.joints.reduce((acc, current) => acc + current.jointMatrix.length, 0);
        const matrix = new Float32Array(size);

        this.joints.forEach((joint, index) => {
            matrix.set(joint.jointMatrix, index * 16);
        });

        return matrix;
    }
}