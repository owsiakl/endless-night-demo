/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-material
 */
export class Material
{
    private constructor(
        public baseColor: [number, number, number, number] | undefined,
        public baseTexture: number | undefined,
    ) {
    }

    public static fromJson(material: GLTF_material): Material
    {
        if (undefined === material.pbrMetallicRoughness) {
            throw new Error(`Materials other than pbr metallic roughness are not implemented.`);
        }

        return new this(
            material.pbrMetallicRoughness.baseColorFactor,
            material.pbrMetallicRoughness.baseColorTexture?.index,
        );
    }

    public get isTexture(): boolean
    {
        return undefined !== this.baseTexture;
    }
}