import {mat4, quat, vec3} from "gl-matrix";
import {Transform} from "./Transform";

export class Object3D
{
    private _worldTransform: mat4 = mat4.create();
    protected _localTransform: Transform = Transform.init();

    protected _parent: Nullable<Object3D> = null;
    private _children: Object3D[] = [];

    public set translation(translation: vec3)
    {
        this._localTransform.translation = translation;
    }

    public get translation() : vec3
    {
        return this._localTransform.translation;
    }

    public set rotation(rotation: quat)
    {
        this._localTransform.rotation = rotation;
    }

    public get rotation() : quat
    {
        return this._localTransform.rotation;
    }

    public set scale(scale: vec3)
    {
        this._localTransform.scale = scale;
    }

    public get scale() : vec3
    {
        return this._localTransform.scale;
    }

    public get localTransform() : Transform
    {
        return this._localTransform;
    }

    public get worldTransform() : mat4
    {
        return this._worldTransform;
    }

    public setChild(child: Object3D) : void
    {
        child._parent = this;

        this._children.push(child);
    }

    public traverse(callback: (object: Object3D) => void) : void
    {
        callback(this);

        for (let i = 0, length = this._children.length; i < length; i++)
        {
            this._children[i].traverse(callback);
        }
    }

    public updateMatrixWorld() : void
    {
        this.traverse(object => object.calculateTransforms());
    }

    protected calculateTransforms() : void
    {
        if (null === this._parent)
        {
            mat4.copy(this._worldTransform, this._localTransform.matrix)
        }
        else
        {
            this._worldTransform = mat4.multiply(mat4.create(), this._parent.worldTransform, this._localTransform.matrix);
        }
    }
}