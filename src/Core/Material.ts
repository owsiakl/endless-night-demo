import {mat4, vec3} from "gl-matrix";
import {types} from "sass";
import Null = types.Null;

export class Material
{
    public image:  Nullable<HTMLImageElement>;
    public color:  Nullable<vec3>;
    public vertexColors;
    public light;
    public lightPosition: Nullable<vec3>;
    public shadow: boolean;
    public texture: Nullable<WebGLTexture>;
    public textureName: Nullable<string>;
    public depthMap: boolean;

    public constructor()
    {
        this.image = null;
        this.color = null;
        this.vertexColors = false;
        this.light = false;
        this.lightPosition = null;
        this.shadow = false;
        this.texture = null;
        this.textureName = null;
        this.depthMap = false;
    }

    public setImage(image: HTMLImageElement) : this
    {
        this.image = image;

        return this;
    }

    public setTexture(name: string, texture: WebGLTexture) : this
    {
        this.texture = texture;
        this.textureName = name;
        this.color = null;

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

    public useShadow()
    {
        this.shadow = true;

        return this;
    }
}