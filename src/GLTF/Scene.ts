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