import {Accessor} from "./Accessor";
import {Mesh} from "./Mesh";
import {BufferView} from "./BufferView";
import {Buffer} from "./Buffer";
import {Scene} from "./Scene";
import {Node} from "./Node";
import {Material} from "./Material";
import {Texture} from "./Texture";
import {Image} from "./Image";
import {Sampler} from "./Sampler";

export class Loader
{
    private constructor(
        public defaultScene: number,
        public accessors: Array<Accessor>,
        public meshes: Array<Mesh>,
        public bufferViews: Array<BufferView>,
        public buffers: Array<Buffer>,
        public scenes: Array<Scene>,
        public nodes: Array<Node>,
        public materials: Array<Material>,
        public texture: Array<Texture> | undefined,
        public images: Array<Image> | undefined,
        public samplers: Array<Sampler> | undefined,
    ) {
    }

    public static parse(model: GLTF) : Loader
    {
        if ('2.0' !== model.asset.version) {
            throw new Error(`GLTF versions other than ${model.asset.version} are not implemented.`);
        }

        if (undefined === model.scene) {
            throw new Error(`GLTF must have some default scene defined.`);
        }

        if (model.accessors === undefined ||
            model.meshes === undefined ||
            model.bufferViews === undefined ||
            model.buffers === undefined ||
            model.scenes === undefined ||
            model.nodes === undefined ||
            model.materials === undefined
        ) {
            throw new Error(`GLTF file must have some data.`);
        }

        const accessors = model.accessors.map(accessor => Accessor.fromJson(accessor));
        const meshes = model.meshes.map(mesh => Mesh.fromJson(mesh));
        const bufferViews = model.bufferViews.map(bufferView => BufferView.fromJson(bufferView));
        const buffers = model.buffers.map(buffer => Buffer.fromJson(buffer));
        const scenes = model.scenes.map(scene => Scene.fromJson(scene));
        const nodes = model.nodes.map(node => Node.fromJson(node));
        const materials = model.materials.map(material => Material.fromJson(material));
        const textures = model.textures?.map(texture => Texture.fromJson(texture));
        const images = model.images?.map(image => Image.fromJson(image));
        const samplers = model.samplers?.map(sampler => Sampler.fromJson(sampler));

        return new this(
            model.scene,
            accessors,
            meshes,
            bufferViews,
            buffers,
            scenes,
            nodes,
            materials,
            textures,
            images,
            samplers,
        );
    }
}