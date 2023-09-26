/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-bufferview
 */
export class BufferView
{
    public readonly buffer: number;
    public readonly byteOffset: number;
    public readonly byteLength: number;
    public readonly byteStride: number;
    public readonly target: Nullable<number>;

    private constructor(buffer: number, byteOffset: number, byteLength: number, byteStride: number, target: Nullable<number>)
    {
        this.buffer = buffer;
        this.byteOffset = byteOffset;
        this.byteLength = byteLength;
        this.byteStride = byteStride;
        this.target = target;
    }

    public static fromJson(bufferView: khr_gltf_buffer_view) : BufferView
    {
        return new this(
            bufferView.buffer,
            bufferView.byteOffset ?? 0,
            bufferView.byteLength,
            bufferView.byteStride ?? 0,
            bufferView.target ?? null,
        );
    }

    public get isInterleaved() : boolean
    {
        return this.byteStride > 0;
    }
}