import {Object3D} from "../Object3D";
import {mat4} from "gl-matrix";

export class Bone extends Object3D
{
    private _boneTransform: mat4 = mat4.create();

    constructor()
    {
        super();

        this._boneTransform = mat4.create();
    }

    public calculateTransforms() : void
    {
        super.calculateTransforms();

        if (this._parent instanceof Bone)
        {
            this._boneTransform = mat4.multiply(mat4.create(), this._parent._boneTransform, this._localTransform.matrix);
        }
        else
        {
            mat4.copy(this._boneTransform, this._localTransform.matrix)
        }
    }

    public get boneTransform() : mat4
    {
        return this._boneTransform;
    }
}