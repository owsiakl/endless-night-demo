import {BufferView} from "./BufferView";
import {Buffer} from "./Buffer";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-accessor
 */
export class Accessor
{
    public readonly bufferView: BufferView;
    public readonly buffer: Buffer;
    public readonly byteOffset: number;
    public readonly componentType: number;
    public readonly count: number;
    public readonly type: string;

    private constructor(bufferView: BufferView, buffer: Buffer, byteOffset: number, componentType: number, count: number, type: string)
    {
        this.bufferView = bufferView;
        this.buffer = buffer;
        this.byteOffset = byteOffset;
        this.componentType = componentType;
        this.count = count;
        this.type = type;
    }

    public static fromJson(accessor: khr_gltf_accessor, bufferViews: Array<BufferView>, buffers: Array<Buffer>) : Accessor
    {
        const bufferView = bufferViews[accessor.bufferView];
        const buffer = buffers[bufferView.buffer];

        return new this(
            bufferView,
            buffer,
            accessor.byteOffset ?? 0,
            accessor.componentType,
            accessor.count,
            accessor.type,
        );
    }

    public get data() : TypedArray
    {
        const bufferView = this.bufferView;
        const buffer = this.buffer;
        const TypedArray = this.typedArray;

        if (bufferView.isInterleaved) {
            const allData = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset + this.byteOffset);
            const filteredData = new TypedArray(this.length);
            const componentStride = bufferView.byteStride / TypedArray.BYTES_PER_ELEMENT;

            for (let i = 0; i < this.count; i++) {
                const start = componentStride * i;
                const end = start + this.typeSize;
                filteredData.set(allData.slice(start, end), i * this.typeSize);
            }

            return new TypedArray(filteredData, bufferView.byteOffset + this.byteOffset);
        }

        return new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset + this.byteOffset, this.count * this.typeSize);
    }

    public get typeSize() : number
    {
        switch (this.type) {
            case 'SCALAR': return 1;
            case 'VEC2': return 2;
            case 'VEC3': return 3;
            case 'VEC4': return 4;
            case 'MAT2': return 4;
            case 'MAT3': return 9;
            case 'MAT4': return 16;
            default: throw new Error(`Can't get typed size based on "${this.type}" type`);
        }
    }

    public get typedArray() : TypedArrayConstructor
    {
        switch (this.componentType) {
            case 5121: return Uint8Array;
            case 5122: return Int16Array;
            case 5123: return Uint16Array;
            case 5125: return Uint32Array;
            case 5126: return Float32Array;
            default: throw new Error(`Can't get typed array based on "${this.componentType}" type`);
        }
    }

    public get length() : number
    {
        return this.count * this.typeSize;
    }
}