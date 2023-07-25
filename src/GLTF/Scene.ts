/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-scene
 */
export class Scene
{
    private constructor(
        public node: number,
    ) {
    }

    public static fromJson(scene: GLTF_scene): Scene
    {
        if (scene.nodes.length > 1) {
            throw new Error(`Multi-node scenes are not implemented.`);
        }

        return new this(scene.nodes[0]);
    }
}