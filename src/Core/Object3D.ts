import {mat4, quat, vec3} from "gl-matrix";
import {AnimationClip} from "./Animation/AnimationClip";

export class Object3D
{
    private translation: vec3 = vec3.fromValues(0, 0, 0);
    private rotation: quat = quat.fromValues(0, 0, 0, 1);
    private scale: vec3 = vec3.fromValues(1, 1, 1);

    private transformMatrix: mat4 | null = null;
    private transformChanged: boolean = false;

    private parent: Object3D|null = null;
    public children: Object3D[] = [];

    public worldTransform = mat4.create();

    public animations: AnimationClip[] = [];

    public constructor(public readonly id: number, public readonly name: string)
    {
    }

    public setTranslation(translation: vec3): this
    {
        this.translation = translation;
        this.transformChanged = true;

        return this;
    }

    public setRotation(rotation: quat): this
    {
        this.rotation = rotation;
        this.transformChanged = true;

        return this;
    }

    public setScale(scale: vec3): this
    {
        this.scale = scale;
        this.transformChanged = true;

        return this;
    }

    public updateMatrixWorld() : void
    {
        if (null === this.parent){
            mat4.copy(this.worldTransform, this.localTransform)
        } else {
            mat4.multiply(this.worldTransform, this.parent.worldTransform, this.localTransform);
        }

        for (const children of this.children) {
            children.updateMatrixWorld();
        }
    }

    get localTransform(): mat4
    {
        if (null === this.transformMatrix) {
            this.transformMatrix = mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.translation, this.scale);
        }

        if (null !== this.transformMatrix && this.transformChanged) {
            this.transformMatrix = mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.translation, this.scale);
        }

        this.transformChanged = false;

        return this.transformMatrix;
    }

    public setChild(child: Object3D) : void
    {
        child.parent = this;

        this.children.push(child);
    }
}