export class GeometryAttribute
{
    public constructor(
        public readonly name: string,
        public readonly data: ArrayBufferView,
        public readonly itemSize: number,
        public readonly normalized: boolean = false,
    ) {
    }
}