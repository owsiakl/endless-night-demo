import {Accessor, AccessorData} from "./Accessor";
import {BufferView} from "./BufferView";
import {Buffer} from "./Buffer";
import {mat4, quat, vec3} from "gl-matrix";
import {Skeleton} from "../Core/Skeleton";
import {Object3D} from "../Core/Object3D";
import {Geometry} from "../Core/Geometry";
import {ATTRIBUTES, TYPE_SIZES} from "./Constants";
import {TranslationKeyframe} from "../Core/Animation/Keyframe/TranslationKeyframe";
import {Interpolator} from "../Core/Animation/Interpolator";
import {RotationKeyframe} from "../Core/Animation/Keyframe/RotationKeyframe";
import {ScaleKeyframe} from "../Core/Animation/Keyframe/ScaleKeyframe";
import {AnimationClip} from "../Core/Animation/AnimationClip";
import {Interpolation} from "../Core/Animation/Interpolation";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {Material} from "../Core/Material";
import {Mesh} from "../Core/Object/Mesh";

export class Loader
{
    private nodesCache: Map<number, Object3D> = new Map();

    private constructor(
        public model: GLTF,
        public defaultScene: number,
        public accessors: Array<Accessor>,
        public bufferViews: Array<BufferView>,
        public buffers: Array<Buffer>,
    ) {
    }

    public static async parseBinary(model: ArrayBuffer) : Promise<Loader>
    {
        const header = new Uint32Array(model, 0, 3);

        if (0x46546c67 !== header[0])
        {
            throw new Error('GLB magic number is not valid.')
        }

        if (2 !== header[1])
        {
            throw new Error(`GLTF versions other than ${header[1]} are not implemented.`);
        }


        const jsonChunkHeader = new Uint32Array(model, 12, 2);
        const jsonByteOffset = 20;
        const jsonByteLength = jsonChunkHeader[0];

        if (0x4e4f534a !== jsonChunkHeader[1])
        {
            throw new Error('Unexpected GLB layout.');
        }

        const jsonText = new TextDecoder().decode(model.slice(jsonByteOffset, jsonByteOffset + jsonByteLength));
        const json = JSON.parse(jsonText);


        // JSON only
        if (jsonByteOffset + jsonByteLength === model.byteLength)
        {
            return json;
        }

        const binaryChunkHeader = new Uint32Array(model, jsonByteOffset + jsonByteLength, 2);

        if (0x004E4942 !== binaryChunkHeader[1])
        {
            throw new Error('Unexpected GLB layout.');
        }

        // Decode content.
        const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
        const binaryByteLength = binaryChunkHeader[0];
        const binary = model.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);

        // Attach binary to buffer
        json.buffers[0].binary = binary;

        console.log(json);

        return this.parse(json);
    }

    public static async parse(model: GLTF) : Promise<Loader>
    {

        if ('2.0' !== model.asset.version) {
            throw new Error(`GLTF versions other than ${model.asset.version} are not implemented.`);
        }

        if (undefined === model.scene) {
            throw new Error(`GLTF must have some default scene defined.`);
        }

        // if (model.skins && model.skins.length > 1) {
        //     throw new Error(`GLTF multi-skins are not implemented yet.`);
        // }

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
        const bufferViews = model.bufferViews.map(bufferView => BufferView.fromJson(bufferView));
        const buffers = model.buffers.map(buffer => Buffer.fromJson(buffer));

        for (const buffer of buffers) {
            await buffer.arrayBufferAsync();
        }

        return new this(
            model,
            model.scene,
            accessors,
            bufferViews,
            buffers
        );
    }

    public getBufferData(index: number) : Uint8Array
    {
        const bufferView = this.bufferViews[index];
        const buffer = this.buffers[bufferView.buffer];

        return new Uint8Array(buffer.arrayBuffer(), bufferView.byteOffset, bufferView.byteLength / Uint8Array.BYTES_PER_ELEMENT)
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

    public async getMesh(index: number, isSkinned: boolean = false, id: number)
    {
        const mesh = this.model.meshes ? this.model.meshes[index] : undefined;

        if (undefined === mesh)
        {
            throw new Error(`Mesh with index "${index}" doesn't exists.`);
        }

        if (mesh.primitives.length > 1)
        {
            throw new Error(`Mesh with multi-primitives are not supported.`);
        }

        const name = mesh.name ?? `mesh_${index}`;
        // const id = index;
        const indices = mesh.primitives[0].indices;
        const attributes = mesh.primitives[0].attributes;
        const material = mesh.primitives[0].material;

        const geometry = new Geometry();

        if (undefined !== indices)
        {
            geometry.index = this.getAccessorData(indices);
            geometry.count = geometry.index.length;
        }

        for (const [name, index] of Object.entries(attributes))
        {
            // @ts-ignore
            const attr = ATTRIBUTES[name];
            const accessor = this.model.accessors ? this.model.accessors[index] : undefined;

            if (undefined === attr || undefined === accessor)
            {
                throw new Error(`Cannot create geometry attribute from name "${name}".`)
            }

            if ('position' === attr && undefined === indices)
            {
                geometry.count = this.getAccessorData(index).length / TYPE_SIZES[accessor.type];
            }

            geometry.setAttribute('a_' + attr, this.getAccessorData(index), TYPE_SIZES[accessor.type]);
        }

        return isSkinned
            ? new SkinnedMesh(id, name, geometry, await this.getMaterial(material!))
            : new Mesh(id, name, geometry, new Material());
    }

    public async getNode(index: number) : Promise<Object3D>
    {
        if (this.nodesCache.has(index)) {
            return this.nodesCache.get(index)!;
        }

        const node = this.model.nodes ? this.model.nodes[index] : undefined;

        if (undefined === node)
        {
            throw new Error(`Node with index "${index}" doesn't exists.`);
        }

        const name = node?.name ?? `node_${index}`;
        const id = index;

        let object: Object3D|null = null;

        if (undefined !== node.mesh && undefined !== node.skin)
        {
            object = await this.getMesh(node.mesh, true, id);
            // @ts-ignore
            object.skeleton = await this.getSkin(node.skin, id);
        }

        if (undefined !== node.mesh && undefined === node.skin)
        {
            object = await this.getMesh(node.mesh, false, id);
        }

        if (undefined === node.mesh && undefined === node.skin)
        {
            object = new Object3D(id, name);
        }

        if (null === object)
        {
            throw new Error(`Cannot create object from node "${name}".`)
        }

        if (undefined !== node.matrix)
        {
            object.setTranslation(mat4.getTranslation(vec3.create(), node.matrix));
            object.setRotation(mat4.getRotation(quat.create(), node.matrix));
            object.setScale(mat4.getScaling(vec3.create(), node.matrix));
        }

        if (undefined !== node.translation)
        {
            object.setTranslation(vec3.fromValues(...node.translation));
        }

        if (undefined !== node.rotation)
        {
            object.setRotation(quat.fromValues(...node.rotation));
        }

        if (undefined !== node.scale)
        {
            object.setScale(vec3.fromValues(...node.scale));
        }

        if (undefined !== node.children)
        {
            for (let i = 0; i < node.children.length; i++)
            {
                object.setChild(await this.getNode(node.children[i]));
            }
        }

        this.nodesCache.set(index, object);

        return object;
    }

    public async getSkin(index: number, id: number) : Promise<Skeleton>
    {
        const skin = this.model.skins ? this.model.skins[index] : undefined;

        if (undefined === skin)
        {
            throw new Error(`Skin with index "${index}" doesn't exists.`);
        }

        const mergedInverseMatrices = this.getAccessorData(skin.inverseBindMatrices);

        const bones = [];
        const inverseMatrices = [];

        for (let i = 0; i < skin.joints.length; i++)
        {
            bones.push(await this.getNode(skin.joints[i]));
            inverseMatrices.push(mergedInverseMatrices.slice(i * 16, (i + 1) * 16) as mat4)
        }

        return new Skeleton(bones, inverseMatrices);
    }

    public getTexture(index: number) : Promise<HTMLImageElement>
    {
        const texture = this.model.textures ? this.model.textures[index] : undefined;

        if (undefined === texture)
        {
            throw new Error(`Texture with index "${index}" doesn't exists.`);
        }

        const sampler = this.model.samplers![texture.sampler!];
        const image = this.model.images![texture.source!];

        let uri = ``;

        // from buffer
        if (undefined !== image.bufferView)
        {
            const imageData = this.getBufferData(image.bufferView);
            const blob = new Blob([imageData], {type: image.mimeType});

            uri = URL.createObjectURL(blob);
        }

        // from uri: data
        if (undefined !== image.uri && image.uri.startsWith('data:'))
        {
            uri = image.uri;
        }

        // from uri: file
        if (undefined !== image.uri && !image.uri.startsWith('data:'))
        {
            uri = `/image/${image.uri}`;
        }

        return new Promise((resolve, reject) => {
            const image = new globalThis.Image();

            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Cannot fetch image from file.'));

            image.src = uri;
        });
    }

    public async getAnimation(index: number)
    {
        const animation = this.model.animations ? this.model.animations[index] : undefined;

        if (undefined === animation)
        {
            throw new Error(`Animation with index "${index}" doesn't exists.`);
        }

        const keyframes = [];

        for (let i = 0, length = animation.channels.length; i < length; i++)
        {
            const channel = animation.channels[i];
            const node = await this.getNode(channel.target.node!);
            const sampler = animation.samplers[channel.sampler];
            const target = channel.target.path;
            const interpolation = sampler.interpolation ?? Interpolation.LINEAR;

            const times = this.getAccessorData(sampler.input);
            const values = this.getAccessorData(sampler.output);

            const size = values.length / times.length;

            const parsedValues = [];

            for (let j = 0; j < values.length; j += size)
            {
                parsedValues.push(values.slice(j, j + size));
            }

            switch (target) {
                case 'translation':
                    keyframes.push(new TranslationKeyframe(node.id, Array.from(times), parsedValues as vec3[], new Interpolator(interpolation)));
                    break;

                case 'rotation':
                    keyframes.push(new RotationKeyframe(node.id, Array.from(times), parsedValues as quat[], new Interpolator(interpolation)));
                    break;

                case 'scale':
                    keyframes.push(new ScaleKeyframe(node.id, Array.from(times), parsedValues as vec3[], new Interpolator(interpolation)));
                    break;

                default:
                    throw new Error(`Unknown keyframe target "${target}".`)
            }
        }

        return new AnimationClip(animation.name ?? `animation_${index}`, keyframes);
    }

    public getAnimations()
    {
        return this.model.animations?.map((anim, index) => this.getAnimation(index)) ?? [];
    }

    public async getScene(index: number)
    {
        const scene = this.model.scenes ? this.model.scenes[index] : undefined;

        if (undefined === scene)
        {
            throw new Error(`Scene with index "${index}" doesn't exists.`);
        }

        const newScene = new Object3D(999, 'scene');

        for (let i = 0; i < scene.nodes.length; i++)
        {
            newScene.setChild(await this.getNode(scene.nodes[i]))
        }

        return newScene;
    }

    public async getMaterial(index: number)
    {
        const material = this.model.materials ? this.model.materials[index] : undefined;

        if (undefined === material)
        {
            throw new Error(`Material with index "${index}" doesn't exists.`);
        }

        const textureIndex = material.pbrMetallicRoughness?.baseColorTexture?.index;

        if (undefined === textureIndex)
        {
            throw new Error('Only textured material is supported now.');
        }

        return (new Material()).setImage(
            await this.getTexture(textureIndex)
        );
    }
}