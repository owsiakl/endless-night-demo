import { vec3} from "gl-matrix";

export class Material
{
    public image:  Nullable<HTMLImageElement>;
    public color:  Nullable<vec3>;
    public vertexColors;
    public castShadow: boolean;

    public constructor()
    {
        this.image = null;
        this.color = null;
        this.vertexColors = false;
        this.castShadow = true;
    }

    public setImage(image: HTMLImageElement) : this
    {
        this.image = image;

        return this;
    }

    public setColor(color: vec3) : this
    {
        this.color = color;

        return this;
    }

    public disableShadows() : this
    {
        this.castShadow = false;

        return this;
    }
}