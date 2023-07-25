export class BufferView
{
    constructor(
        public buffer: number,
        public byteOffset: number,
        public byteLength: number,
        public target: number | undefined
    ) {
    }

    public static fromJson(bufferView: GLTF_buffer_view): BufferView
    {
        return new this(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength,
            bufferView.target,
        );
    }
}