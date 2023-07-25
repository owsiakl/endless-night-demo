/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-image
 */
export class Image
{
    private constructor(
        public name: string | undefined,
        public mimeType: string | undefined,
        public bufferView: number | undefined,
        public uri: string | undefined,
    ) {
    }

    public static fromJson(image: GLTF_image): Image
    {
        return new this(
            image.name,
            image.mimeType,
            image.bufferView,
            image.uri,
        );
    }

    public get isFromFile(): boolean
    {
        return this.uri !== undefined;
    }

    public get isFromBuffer(): boolean
    {
        return this.bufferView !== undefined;
    }
}