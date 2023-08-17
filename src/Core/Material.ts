import {mat4, vec3} from "gl-matrix";

export class Material
{
    public image:  Nullable<HTMLImageElement>;
    public color:  Nullable<vec3>;
    public vertexColors;
    public light;
    public lightPosition: Nullable<vec3>;
    public shadow: boolean;
    public shadowImage: Nullable<HTMLImageElement>;
    public shadowTextureMatrix: Nullable<mat4>;

    public constructor()
    {
        this.image = null;
        this.color = null;
        this.vertexColors = false;
        this.light = false;
        this.lightPosition = null;
        this.shadow = false;
        this.shadowImage = null;
        this.shadowTextureMatrix = null;
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

    public useVertexColors()
    {
        this.vertexColors = true;

        return this;
    }

    public useLight(position: vec3 = vec3.fromValues(0, 0, 0))
    {
        this.light = true;
        this.lightPosition = position;

        return this;
    }

    public useShadow(image: HTMLImageElement, shadowTextureMatrix: mat4)
    {
        this.shadow = true;
        this.shadowImage = image;
        this.shadowTextureMatrix = shadowTextureMatrix;

        return this;
    }
}