import {vec3} from "gl-matrix";
import {Material as CoreMaterial} from "../../Core/Material/Material";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-material
 */
export class Material
{
    public static fromJson(material: khr_gltf_material | undefined, images: Array<HTMLImageElement>) : CoreMaterial
    {
        if (undefined === material)
        {
            return (new CoreMaterial()).setColor(vec3.fromValues(.4, .4, .4))
        }

        const textureIndex = material.pbrMetallicRoughness?.baseColorTexture?.index;

        if (undefined === textureIndex)
        {
            throw new Error('Only textured material is supported now.');
        }

        return (new CoreMaterial()).setImage(images[textureIndex]);
    }
}