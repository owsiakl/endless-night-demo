import {Object3D} from "./Object3D";
import {Light} from "../Light/Light";
import {Mesh} from "./Object/Mesh";
import {Line} from "./Object/Line";
import {PointLight} from "../Light/PointLight";
import {Point} from "./Object/Point";

export class Scene
{
    public objects: Array<Object3D>;
    public light: Nullable<Light>;
    public drawables: Array<Mesh | Line | Point>;

    public constructor()
    {
        this.objects = [];
        this.drawables = [];
        this.light = null;
    }

    public addLight(light: Light) : this
    {
        this.objects.push(light);

        this.light = light;

        return this;
    }

    public add(...objects: Array<Object3D>) : this
    {
        this.objects.push(...objects);

        for (let i = 0; i < objects.length; i++)
        {
            objects[i].traverse(item => {
                if (item instanceof Line)
                {
                    this.drawables.push(item);
                }
                else if (item instanceof Mesh)
                {
                    this.drawables.push(item);
                }
                else if (item instanceof Point)
                {
                    this.drawables.push(item);
                }
                else if (item instanceof PointLight)
                {
                    this.light = item;
                }
            })
        }

        return this;
    }

    public updateMatrixWorld()
    {
        for (let i = 0, length = this.objects.length; i < length; i++)
        {
            this.objects[i].updateMatrixWorld();
        }
    }

    public traverse(callback: (object: Object3D) => boolean|void) : void
    {
        for (let i = 0, l = this.objects.length; i < l; i++)
        {
            this.objects[i].traverse(callback);
        }
    }
}