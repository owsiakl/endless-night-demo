export class Primitive
{
    private constructor(
        public position: number,
        public color: number | undefined,
        public normal: number | undefined,
        public texture: number | undefined,
        public joints: number | undefined,
        public weights: number | undefined,
        public indices: number | undefined,
        public material: number | undefined,
    ) {
    }

    public static fromJson(primitive: GLTF_primitive): Primitive
    {
        let position = undefined,
            color = undefined,
            normal = undefined,
            texture = undefined,
            joints = undefined,
            weights = undefined;

        for (const [attribute, index] of Object.entries(primitive.attributes)) {
            switch (attribute) {
                case 'POSITION': position = index; break;
                case 'COLOR_0': color = index; break;
                case 'NORMAL': normal = index; break;
                case 'TEXCOORD_0': texture = index; break;
                case 'JOINTS_0': joints = index; break;
                case 'WEIGHTS_0': weights = index; break;
                default: throw new Error(`Mesh primitive attribute "${attribute}" couldn't be recognized.`);
            }
        }

        if (undefined === position) {
            throw new Error(`Mesh primitive doesn't have any position.`)
        }

        return new this(
            position,
            color,
            normal,
            texture,
            joints,
            weights,
            primitive.indices,
            primitive.material
        );
    }
}