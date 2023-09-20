import {Object3D} from "./Object3D";
import {Light} from "../Light/Light";
import {Mesh} from "./Object/Mesh";
import {Line} from "./Object/Line";
import {NullLight} from "../Light/NullLight";
import {PointLight} from "../Light/PointLight";
import {Point} from "./Object/Point";
import {Particle} from "./Object/Particle";

export class Scene
{
    public objects: Array<Object3D>;
    public light: Light;
    public drawables: Array<Mesh | Line>;
    public particles: Nullable<Particle>;

    public constructor()
    {
        this.objects = [];
        this.drawables = [];
        this.particles = null;
        this.light = new NullLight();
    }

    public addLight(light: Light) : this
    {
        if (!(this.light instanceof NullLight))
        {
            throw new Error('Currently only one scene light is supported.');
        }

        this.objects.push(light);

        this.light = light;

        return this;
    }

    public add(object: Object3D) : this
    {
        this.objects.push(object);

        object.traverse(item => {
            if (item instanceof Line)
            {
                this.drawables.push(item);
            }
            else if (item instanceof Mesh)
            {
                this.drawables.push(item);
            }
            else if (item instanceof Particle)
            {
                this.particles = item;
            }
            else if (item instanceof PointLight)
            {
                this.light = item;
            }
        })

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