import {Node} from "./Node";
import {mat4} from "gl-matrix";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-scene
 */
export class Scene
{
    private constructor(public nodes: Array<Node>)
    {
    }

    public static fromJson(scene: GLTF_scene, nodesList: Array<Node>): Scene
    {
        return new this(scene.nodes.map(index => nodesList[index]));
    }

    public applyTransforms()
    {
        for (const node of this.nodes) {
            node.applyTransforms(mat4.create())
        }
    }
}