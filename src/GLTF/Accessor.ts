export type AccessorData = Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;
export type AccessorDataConstructor = Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-accessor
 */
export class Accessor
{
    constructor(
        public bufferView: number,
        public byteOffset: number,
        public componentType: number,
        public count: number,
        public type: string,
    ) {
    }

    public static fromJson(accessor: GLTF_accessor): Accessor
    {
        return new this(
            accessor.bufferView,
            accessor.byteOffset ?? 0,
            accessor.componentType,
            accessor.count,
            accessor.type,
        );
    }

    public get typeSize(): number
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

    public get typedArray(): AccessorDataConstructor
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

    public get length(): number
    {
        return this.count * this.typeSize;
    }
}