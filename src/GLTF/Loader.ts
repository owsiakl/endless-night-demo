import {Accessor, AccessorData} from "./Accessor";
import {BufferView} from "./BufferView";
import {Buffer} from "./Buffer";
import {mat4, quat, vec3} from "gl-matrix";
import {Object3D} from "../Core/Object3D";
import {Geometry} from "../Core/Geometry";
import {ATTRIBUTES, TYPE_SIZES} from "./Constants";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {Material} from "../Core/Material";
import {Mesh} from "../Core/Object/Mesh";
import {Transform} from "../Core/Transform";
import {Skeleton} from "../Core/Skeleton";
import {AnimationClip} from "../Animation/AnimationClip";
import {TransformTrack} from "../Animation/TransformTrack";
import {Track} from "../Animation/Track";
import {VectorFrame} from "../Animation/Frame/VectorFrame";
import {QuaternionFrame} from "../Animation/Frame/QuaternionFrame";
import {Interpolation} from "../Animation/Interpolation";
import {Pose} from "../Animation/Pose";

export class Loader
{
    private constructor(
        public model: GLTF,
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

        // console.log(json);

        // Attach binary to buffer
        json.buffers[0].binary = binary;

        return this.parse(json);
    }

    public static async parse(model: GLTF) : Promise<Loader>
    {
        if ('2.0' !== model.asset.version) {
            throw new Error(`GLTF versions other than ${model.asset.version} are not implemented.`);
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
        const bufferViews = model.bufferViews.map(bufferView => BufferView.fromJson(bufferView));
        const buffers = model.buffers.map(buffer => Buffer.fromJson(buffer));

        for (const buffer of buffers) {
            await buffer.arrayBufferAsync();
        }

        return new this(
            model,
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

    public async getMesh(index: number) : Promise<Mesh>
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

        return new Mesh(geometry, await this.getMaterial(material!));
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

    public async traverseNode(index: int, callback: (index: int, node: GLTF_node) => void) : Promise<void>
    {
        const node = this.model.nodes ? this.model.nodes[index] : undefined;

        if (undefined === node)
        {
            throw new Error(`Scene with index "${index}" doesn't exists.`);
        }

        await callback(index, node);

        for (const child of node.children ?? [])
        {
            await this.traverseNode(child, callback);
        }
    }

    public get defaultScene() : int
    {
        return this.model.scene ?? 0;
    }

    public async getScene(index: number = this.defaultScene)
    {
        const scene = this.model.scenes ? this.model.scenes[index] : undefined;

        if (undefined === scene)
        {
            throw new Error(`Scene with index "${index}" doesn't exists.`);
        }

        const newScene = new Object3D();

        for (let i = 0; i < scene.nodes.length; i++)
        {
            await this.traverseNode(
                scene.nodes[i],
                async (index, node) =>
                {
                    if (undefined !== node.mesh && undefined !== node.skin)
                    {
                        const mesh = await this.getMesh(node.mesh);

                        newScene.setChild(new SkinnedMesh(mesh.geometry, mesh.material, this.getSkeleton(node.skin)));
                    }
                });
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

        // return (new Material()).setColor(vec3.fromValues(0.4, 0.4, 0));

        return (new Material()).setImage(
            await this.getTexture(textureIndex)
        );
    }

    public getNodeParent(index: int) : int
    {
        if (undefined === this.model.nodes)
        {
            throw new Error('There are no nodes in the model.');
        }

        for (let i = 0; i < this.model.nodes.length; i++)
        {
            const node = this.model.nodes[i];

            if (node.children?.includes(index))
            {
                return i;
            }
        }

        return -1;
    }

    public getAnimation() : Array<AnimationClip>
    {
        if (undefined === this.model.animations)
        {
            throw new Error('There are no animations in the model.');
        }

        const clips = [];

        for (let a = 0; a < this.model.animations.length; a++)
        {
            const animation = this.model.animations[a];
            const name = animation.name ?? `animation_${a}`;
            const clip = new AnimationClip(name);

            for (let c = 0; c < animation.channels.length; c++)
            {
                const channel = animation.channels[c];
                const nodeId = channel.target.node;
                const path = channel.target.path;
                const sampler = animation.samplers[channel.sampler];
                const times = this.getAccessorData(sampler.input);
                const values = this.getAccessorData(sampler.output);

                if (undefined === nodeId)
                {
                    /**
                     * invalid file - channel isn't referring to any node.
                     * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-animation-channel-target
                     */

                    continue;
                }

                let interpolation = Interpolation.LINEAR;

                if ('STEP' === sampler.interpolation)
                {
                    interpolation = Interpolation.STEP;
                }

                if ('CUBICSPLINE' === sampler.interpolation)
                {
                    throw new Error('GLTF: cubic spline interpolation is not implemented.');
                }

                const transformTrack = new TransformTrack(nodeId);
                const size = values.length / times.length;

                if ('translation' === path)
                {
                    const frames = [];

                    for (let t = 0; t < times.length; t++)
                    {
                        frames.push(new VectorFrame(times[t], values.slice(t * size, (t * size) + size) as vec3))
                    }

                    transformTrack.translation = new Track<vec3>(frames, interpolation);
                }

                if ('rotation' === path)
                {
                    const frames = [];

                    for (let t = 0; t < times.length; t++)
                    {
                        frames.push(new QuaternionFrame(times[t], values.slice(t * size, (t * size) + size) as quat))
                    }

                    transformTrack.rotation = new Track<quat>(frames, interpolation);
                }

                if ('scale' === path)
                {
                    const frames = [];

                    for (let t = 0; t < times.length; t++)
                    {
                        frames.push(new VectorFrame(times[t], values.slice(t * size, (t * size) + size) as vec3))
                    }

                    transformTrack.scale = new Track<vec3>(frames, interpolation);
                }

                clip.tracks.push(transformTrack);
            }

            clip.recalculateDuration();
            clips.push(clip);
        }

        return clips;
    }

    public getNodeTransform(index: int) : Transform
    {
        if (undefined === this.model.nodes)
        {
            throw new Error('There are no nodes in the model.');
        }

        const node = this.model.nodes[index];
        const transform = Transform.init();

        if (undefined !== node.matrix)
        {
            transform.translation = mat4.getTranslation(vec3.create(), node.matrix);
            transform.rotation = mat4.getRotation(quat.create(), node.matrix);
            transform.scale = mat4.getScaling(vec3.create(), node.matrix);
        }

        if (undefined !== node.translation)
        {
            transform.translation = vec3.fromValues(...node.translation);
        }

        if (undefined !== node.rotation)
        {
            transform.rotation = quat.fromValues(...node.rotation);
        }

        if (undefined !== node.scale)
        {
            transform.scale = vec3.fromValues(...node.scale);
        }

        return transform;
    }


    public getBindPose() : Pose
    {
        const pose = new Pose();

        for (let i = 0; i < this.model.nodes!.length; i++)
        {
            const node = this.model.nodes![i];

            pose.addNode(
                node.name ?? `node_${i}`,
                this.getNodeTransform(i),
                this.getNodeParent(i)
            );
        }

        return pose;
    }

    public getSkeleton(index: int)
    {
        if (undefined === this.model.skins)
        {
            throw new Error('There are no skins in the model.');
        }

        if (undefined === this.model.nodes)
        {
            throw new Error('There are no nodes in the model.');
        }

        const skin = this.model.skins[index];
        const inverseBindMatrices = this.getAccessorData(skin.inverseBindMatrices);
        const skeleton = new Skeleton(this.getBindPose());

        for (let i = 0; i < skin.joints.length; i++)
        {
            const jointId = skin.joints[i];
            const name = this.model.nodes[jointId].name ?? `joint_${jointId}`;
            const parentId = this.getNodeParent(jointId);
            const ibm = inverseBindMatrices.slice(i * 16, (i + 1) * 16) as mat4

            skeleton.addJoint(name, jointId, parentId, ibm);
        }

        return skeleton;
    }
}