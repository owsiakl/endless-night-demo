import {Primitive} from "./Primitive";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-mesh
 */
export class Mesh
{
    private constructor(
        public name: string | undefined,
        public primitive: Primitive
    ) {
    }

    public static fromJson(mesh: GLTF_mesh): Mesh
    {
        if (mesh.primitives.length > 1) {
            throw new Error(`Multi-primitive meshes are not implemented.`);
        }

        return new this(mesh.name, Primitive.fromJson(mesh.primitives[0]));
    }
}