import { vec3} from "gl-matrix";

export class Material
{
    public image:  Nullable<HTMLImageElement>;
    public imageRepeat:  boolean;
    public normal:  Nullable<HTMLImageElement>;
    public normalRepeat:  boolean;
    public color:  Nullable<vec3>;
    public vertexColors;
    public castShadow: boolean;
    public blending: boolean;

    public constructor()
    {
        this.image = null;
        this.imageRepeat = false;
        this.normal = null;
        this.normalRepeat = false;
        this.color = null;
        this.vertexColors = false;
        this.castShadow = true;
        this.blending = false;
    }

    public setImage(image: HTMLImageElement, repeat: boolean = false) : this
    {
        this.image = image;
        this.imageRepeat = repeat;

        return this;
    }

    public setNormal(normal: HTMLImageElement, repeat: boolean = false) : this
    {
        this.normal = normal;
        this.normalRepeat = repeat;

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

    public useVertexColors()
    {
        this.vertexColors = true;

        return this;
    }

    public useBlending()
    {
        this.blending = true;

        return this;
    }
}