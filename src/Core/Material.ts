export class Material
{
    public image:  Nullable<HTMLImageElement>;
    public vertexColors;

    public constructor()
    {
        this.image = null;
        this.vertexColors = false;
    }

    public setImage(image: HTMLImageElement) : this
    {
        this.image = image;

        return this;
    }

    public useVertexColors()
    {
        this.vertexColors = true;

        return this;
    }
}