export class GeometryAttribute
{
    public constructor(
        public readonly name: string,
        public data: TypedArray,
        public readonly itemSize: number,
        public readonly normalized: boolean = false,
    ) {
    }
}