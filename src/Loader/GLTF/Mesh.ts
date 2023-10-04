import {Mesh as CoreMesh} from "./../../Core/Object/Mesh";
import {Geometry} from "../../Core/Geometry";
import {ATTRIBUTES, TYPE_SIZES} from "./Constants";
import {Accessor} from "./Accessor";
import {Material} from "../../Core/Material/Material";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-mesh
 */
export class Mesh
{
    public static fromJson(mesh: khr_gltf_mesh, accessors: Array<Accessor>, materials: Array<Material>) : CoreMesh
    {
        if (mesh.primitives.length > 1)
        {
            throw new Error(`Mesh with multi-primitives are not supported.`);
        }

        const indices = mesh.primitives[0].indices;
        const attributes = mesh.primitives[0].attributes;
        const material = mesh.primitives[0].material;

        const geometry = new Geometry();

        if (undefined !== indices)
        {
            geometry.index = accessors[indices].data;
            geometry.count = geometry.index.length;
        }

        for (const [name, index] of Object.entries(attributes))
        {
            // @ts-ignore
            const attr = ATTRIBUTES[name];
            const accessor = accessors[index];

            if (undefined === attr || undefined === accessor)
            {
                throw new Error(`Cannot create geometry attribute from name "${name}".`)
            }

            if ('position' === attr && undefined === indices)
            {
                // @ts-ignore
                geometry.count = accessor.length / TYPE_SIZES[accessor.type];
            }

            // @ts-ignore
            geometry.setAttribute('a_' + attr, accessors[index].data, TYPE_SIZES[accessor.type]);
        }

        return new CoreMesh(geometry, materials[material!]);
    }
}