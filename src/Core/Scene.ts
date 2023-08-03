import {Object} from "./Object";

export class Scene
{
    public objects: Object[] = [];

    add(object: Object)
    {
        this.objects.push(object);
    }
}