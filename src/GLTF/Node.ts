export class Node
{
    private constructor(
        public name: string | undefined,
        public mesh: number | undefined,
        public skin: number | undefined,
    ) {
    }

    public static fromJson(node: GLTF_node): Node
    {
        return new this(node.name, node.mesh, node.skin);
    }

    public get isMesh(): boolean
    {
        return undefined !== this.mesh;
    }
}