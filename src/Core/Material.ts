export class Material
{
    public image: HTMLImageElement|null = null;
    public vertexColors  = false;

    constructor(
        public vertexShader: string|null = null,
        public fragmentShader: string|null = null
    ) {
    }

    setImage(image: HTMLImageElement) : this
    {
        this.image = image;

        return this;
    }

    useVertexColors()
    {
        this.vertexColors = true;

        return this;
    }
}