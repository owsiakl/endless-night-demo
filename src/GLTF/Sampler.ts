/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-sampler
 */
export class Sampler
{
    private constructor(
        public minFilter: number | undefined,
        public magFilter: number | undefined,
        public wrapS: number | undefined,
        public wrapT: number | undefined,
    ) {
    }

    public static fromJson(sampler: GLTF_sampler): Sampler
    {
        return new this(
            sampler.minFilter,
            sampler.magFilter,
            sampler.wrapS,
            sampler.wrapT,
        );
    }
}