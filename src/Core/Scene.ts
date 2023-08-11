import {Object3D} from "./Object3D";

export class Scene
{
    public objects: Object3D[] = [];

    public add(object: Object3D)
    {
        this.objects.push(object);
    }

    public updateMatrixWorld()
    {
        for (let i = 0, length = this.objects.length; i < length; i++) {
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