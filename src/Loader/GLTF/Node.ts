import {mat4, quat, vec3} from "gl-matrix";
import {Mesh, Mesh as CoreMesh} from "./../../Core/Object/Mesh";
import {Object3D} from "../../Core/Object3D";
import {Bone} from "../../Core/Object/Bone";
import {SkinnedMesh} from "../../Core/Object/SkinnedMesh";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-node
 */
export class Node
{
    public static fromJson(node: khr_gltf_node, index: int, skins: Array<khr_gltf_skin>, meshes: Array<Mesh>) : Object3D
    {
        let object = new Object3D();

        if (this.isBone(index, skins))
        {
            object = new Bone();
        }

        if (this.isMesh(node))
        {
            const mesh = meshes[node.mesh!];

            object = new CoreMesh(mesh.geometry, mesh.material);
        }

        if (this.isSkinnedMesh(node))
        {
            const mesh = meshes[node.mesh!];

            object = new SkinnedMesh(mesh.geometry, mesh.material);
        }

        if (undefined !== node.matrix)
        {
            object.translation = mat4.getTranslation(vec3.create(), node.matrix);
            object.rotation = mat4.getRotation(quat.create(), node.matrix);
            object.scale = mat4.getScaling(vec3.create(), node.matrix);
        }

        if (undefined !== node.translation)
        {
            object.translation = vec3.fromValues(...node.translation);
        }

        if (undefined !== node.rotation)
        {
            object.rotation = quat.fromValues(...node.rotation);
        }

        if (undefined !== node.scale)
        {
            object.scale = vec3.fromValues(...node.scale);
        }

        return object;
    }

    private static isMesh(node: khr_gltf_node) : boolean
    {
        if (undefined !== node.mesh && undefined === node.skin)
        {
            return true;
        }

        return false;
    }

    private static isSkinnedMesh(node: khr_gltf_node) : boolean
    {
        if (undefined !== node.mesh && undefined !== node.skin)
        {
            return true;
        }

        return false;
    }

    private static isBone(nodeId: int, skins: Array<khr_gltf_skin>) : boolean
    {
        for (let s = 0; s < skins.length; s++)
        {
            const skin = skins[s];

            if (skin.joints.includes(nodeId))
            {
                return true;
            }
        }

        return false;
    }
}