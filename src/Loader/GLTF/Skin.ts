import {mat4} from "gl-matrix";
import {Object3D} from "../../Core/Object3D";
import {Bone} from "../../Core/Object/Bone";
import {Skeleton} from "../../Core/Skeleton";
import {Accessor} from "./Accessor";
import {Pose} from "../../Animation/Pose";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-skin
 */
export class Skin
{
    public static fromJson(skin: khr_gltf_skin, accessors: Array<Accessor>, nodes: Array<Object3D>) : Skeleton
    {
        const inverseBindMatrices = accessors[skin.inverseBindMatrices].data;

        const bindPose = new Pose();

        for (let i = 0; i < nodes.length; i++)
        {
            const node = nodes[i];
            const object = nodes[i];

            bindPose.addNode(
                `node_${i}`,
                object.localTransform,
            );
        }

        const skeleton = new Skeleton(bindPose);

        for (let i = 0; i < skin.joints.length; i++)
        {
            const jointId = skin.joints[i];
            const ibm = inverseBindMatrices.slice(i * 16, (i + 1) * 16) as mat4
            const joint = nodes[jointId];

            if (joint instanceof Bone)
            {
                skeleton.addJoint(joint, ibm);
            }
        }

        return skeleton;
    }
}