/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-bufferview
 */
export class BufferView
{
    constructor(
        public buffer: number,
        public byteOffset: number,
        public byteLength: number,
        public byteStride: number,
        public target: number | undefined
    ) {
    }

    public static fromJson(bufferView: GLTF_buffer_view): BufferView
    {
        return new this(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength,
            bufferView.byteStride ?? 0,
            bufferView.target,
        );
    }
}