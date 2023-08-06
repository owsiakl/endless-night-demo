import {Object3D} from "./Object3D";
import {mat4} from "gl-matrix";

export class Skeleton extends Object3D
{
    constructor(
        public readonly bones: Object3D[],
        public readonly inverseMatrices: mat4[]
    ) {
        super(0, 'skeleton');
    }

    public get jointMatrix(): mat4
    {
        const size = this.bones.length * 16;
        const matrix = new Float32Array(size);

        this.bones.forEach((bone, index) => {

            matrix.set(
                mat4.multiply(mat4.create(), bone.worldTransform, this.inverseMatrices[index]),
                index * 16
            );
        });

        return matrix;
    }

    public updateMatrixWorld()
    {
        for (let i = 0, length = this.bones.length; i < length; i++) {
            this.bones[i].updateMatrixWorld();
        }
    }

    public getBone(id: number) : Object3D
    {
        for (let i = 0; i < this.bones.length; i++) {
            if(this.bones[i].id === id) {
                return this.bones[i];
            }
        }

        throw new Error(`Skeleton doesn't have bone with id "${id}".`);
    }
}