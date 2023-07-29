import {Accessor, AccessorData} from "./Accessor";
import {Mesh} from "./Mesh";
import {BufferView} from "./BufferView";
import {Buffer} from "./Buffer";
import {Scene} from "./Scene";
import {Node} from "./Node";
import {Material} from "./Material";
import {Texture} from "./Texture";
import {Image} from "./Image";
import {Skin} from "./Skin";
import {Keyframe} from "./Animation/Keyframe";
import {quat, vec3} from "gl-matrix";
import {Channel} from "./Animation/Channel";
import {Animation} from "./Animation";
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
        public materials: Array<Material> | undefined,
        public texture: Array<Texture> | undefined,
        public images: Array<Image> | undefined,
        public samplers: Array<Sampler> | undefined,
        public animations: Array<Animation> | undefined,
        public skins: Array<Skin> | undefined,
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

        if (model.skins && model.skins.length > 1) {
            throw new Error(`GLTF multi-skins are not implemented yet..`);
        }

        if (model.accessors === undefined ||
            model.meshes === undefined ||
            model.bufferViews === undefined ||
            model.buffers === undefined ||
            model.scenes === undefined ||
            model.nodes === undefined
        ) {
            throw new Error(`GLTF file must have some data.`);
        }

        const accessors = model.accessors.map(accessor => Accessor.fromJson(accessor));
        const meshes = model.meshes.map(mesh => Mesh.fromJson(mesh));
        const bufferViews = model.bufferViews.map(bufferView => BufferView.fromJson(bufferView));
        const buffers = model.buffers.map(buffer => Buffer.fromJson(buffer));
        const nodes = model.nodes.map((node, index) => Node.fromJson(index, model.nodes!));

        model.nodes.forEach((parent, parentIndex) => {
            parent.children?.forEach((child, childIndex) => {
                nodes[child].setParent(nodes[parentIndex]);
            });
        });

        const scenes = model.scenes.map(scene => Scene.fromJson(scene, nodes));
        const materials = model.materials?.map(material => Material.fromJson(material));
        const textures = model.textures?.map(texture => Texture.fromJson(texture));
        const images = model.images?.map(image => Image.fromJson(image));
        const skins = model.skins?.map(skin => Skin.fromJson(skin));
        const animations = this.parseAnimation(model.animations, nodes, accessors, bufferViews, buffers);
        const samplers = model.samplers?.map(sampler => Sampler.fromJson(sampler));

        scenes.forEach((scene) => {
            scene.applyTransforms();
        });


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
            animations,
            skins,
        );
    }

    static parseAnimation(animations: Array<GLTF_animation>|undefined, nodes: Array<Node>, accessors: Array<Accessor>, bufferViews: Array<BufferView>, buffers: Array<Buffer>): Array<Animation>
    {
        const anims: Array<Animation> = [];

        if (undefined !== animations) {
            animations.forEach((animation, animationIndex) => {
                const name = animation.name ?? 'animation_' + animationIndex;
                const channels: Array<Channel> = [];

                animation.channels.forEach((channel, channelIndex) => {
                    const node = nodes[channel.target.node!];
                    const sampler = animation.samplers[channel.sampler];
                    const target = channel.target.path;
                    const interpolation = sampler.interpolation;
                    const accessor = accessors[sampler.output];

                    const times = Loader.getAccessorDataStatic(sampler.input, accessors, bufferViews, buffers);
                    const values = Loader.getAccessorDataStatic(sampler.output, accessors, bufferViews, buffers);
                    const keyframes: Array<Keyframe> = [];

                    times.forEach((time, index) => {
                        const size = accessor.typeSize;

                        switch (target) {
                            case 'translation':
                                keyframes.push(Keyframe.translation(index, time, values.slice(index * size, (index * size) + size) as vec3));
                                break;
                            case 'rotation':
                                keyframes.push(Keyframe.rotation(index, time, values.slice(index * size, (index * size) + size) as quat));
                                break;
                            case 'scale':
                                keyframes.push(Keyframe.scale(index, time, values.slice(index * size, (index * size) + size) as vec3));
                                break;
                            default:
                                throw new Error(`Unknown keyframe target "${target}".`)
                        }
                    });

                    channels.push(Channel.create(keyframes, node, interpolation, target));
                });

                anims.push(new Animation(name, channels));
            });
        }

        return anims;
    }

    public getAccessorData(index: number) : AccessorData
    {
        const accessor = this.accessors[index];
        const bufferView = this.bufferViews[accessor.bufferView];
        const buffer = this.buffers[bufferView.buffer];
        const TypedArray = accessor.typedArray;

        if (bufferView.isInterleaved) {
            const allData = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset + accessor.byteOffset);
            const filteredData = new TypedArray(accessor.length);
            const componentStride = bufferView.byteStride / TypedArray.BYTES_PER_ELEMENT;

            for (let i = 0; i < accessor.count; i++) {
                const start = componentStride * i;
                const end = start + accessor.typeSize;
                filteredData.set(allData.slice(start, end), i * accessor.typeSize);
            }

            return new TypedArray(filteredData, bufferView.byteOffset + accessor.byteOffset);
        }

        return new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset + accessor.byteOffset, accessor.count * accessor.typeSize);
    }

    public static getAccessorDataStatic(index: number, accessors: Array<Accessor>, bufferViews: Array<BufferView>, buffers: Array<Buffer>) : AccessorData
    {
        const accessor = accessors[index];
        const bufferView = bufferViews[accessor.bufferView];
        const buffer = buffers[bufferView.buffer];
        const TypedArray = accessor.typedArray;

        if (bufferView.isInterleaved) {
            const allData = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset + accessor.byteOffset);
            const filteredData = new TypedArray(accessor.length);
            const componentStride = bufferView.byteStride / TypedArray.BYTES_PER_ELEMENT;

            for (let i = 0; i < accessor.count; i++) {
                const start = componentStride * i;
                const end = start + accessor.typeSize;
                filteredData.set(allData.slice(start, end), i * accessor.typeSize);
            }

            return new TypedArray(filteredData, bufferView.byteOffset + accessor.byteOffset);
        }

        return new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset + accessor.byteOffset, accessor.count * accessor.typeSize);
    }
}