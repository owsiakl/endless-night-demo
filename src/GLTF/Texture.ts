/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-texture
 */
export class Texture
{
    private constructor(
        public sampler: number,
        public source: number,
    ) {
    }

    public static fromJson(texture: GLTF_texture): Texture
    {
        if (undefined === texture.sampler) {
            throw new Error(`Textures without sampler are not implemented.`);
        }

        if (undefined === texture.source) {
            throw new Error(`Textures without source are not implemented.`);
        }

        return new this(
            texture.sampler,
            texture.source,
        );
    }
}