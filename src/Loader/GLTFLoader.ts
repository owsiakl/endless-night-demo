import {Accessor} from "./GLTF/Accessor";
import {BufferView} from "./GLTF/BufferView";
import {Buffer} from "./GLTF/Buffer";
import {Object3D} from "../Core/Object3D";
import {SkinnedMesh} from "../Core/Object/SkinnedMesh";
import {AnimationClip} from "../Animation/AnimationClip";
import {Skeleton} from "../Core/Skeleton";
import {Image} from "./GLTF/Image";
import {Material} from "./GLTF/Material";
import {Mesh} from "./GLTF/Mesh";
import {Animation} from "./GLTF/Animation";
import {Node} from "./GLTF/Node";
import {Skin} from "./GLTF/Skin";
import {Model} from "../Core/Model";

export class GLTFLoader implements Model
{
    private readonly _defaultScene: int;
    private readonly _scenes: Array<Array<int>>;
    private readonly _nodes: Array<Object3D>;
    private readonly _animations: Array<AnimationClip>;
    private readonly _skins: Array<Skeleton>;

    private constructor(defaultScene: int, scenes: Array<Array<int>>, nodes: Array<Object3D>, animations: Array<AnimationClip>, skins: Array<Skeleton>)
    {
        this._defaultScene = defaultScene;
        this._scenes = scenes;
        this._nodes = nodes;
        this._animations = animations;
        this._skins = skins;
    }

    public static async parseBinary(buffer: ArrayBuffer) : Promise<GLTFLoader>
    {
        const header = new Uint32Array(buffer, 0, 3);

        if (0x46546c67 !== header[0])
        {
            throw new Error('GLB magic number is not valid.')
        }

        if (2 !== header[1])
        {
            throw new Error(`GLTF versions other than ${header[1]} are not implemented.`);
        }

        const jsonChunkHeader = new Uint32Array(buffer, 12, 2);
        const jsonByteOffset = 20;
        const jsonByteLength = jsonChunkHeader[0];

        if (0x4e4f534a !== jsonChunkHeader[1])
        {
            throw new Error('Unexpected GLB layout.');
        }

        const jsonText = new TextDecoder().decode(buffer.slice(jsonByteOffset, jsonByteOffset + jsonByteLength));
        const json = JSON.parse(jsonText);

        if (jsonByteOffset + jsonByteLength === buffer.byteLength)
        {
            return json;
        }

        const binaryChunkHeader = new Uint32Array(buffer, jsonByteOffset + jsonByteLength, 2);

        if (0x004E4942 !== binaryChunkHeader[1])
        {
            throw new Error('Unexpected GLB layout.');
        }

        const binaryByteOffset = jsonByteOffset + jsonByteLength + 8;
        const binaryByteLength = binaryChunkHeader[0];

        json.buffers[0].binary = buffer.slice(binaryByteOffset, binaryByteOffset + binaryByteLength);

        return this.parse(json);
    }

    public static async parse(gltf: khr_gltf) : Promise<GLTFLoader>
    {
        if ('2.0' !== gltf.asset.version)
        {
            throw new Error(`GLTF versions other than ${gltf.asset.version} are not implemented.`);
        }

        const defaultScene = gltf.scene ?? 0;
        const scenes = gltf.scenes ? gltf.scenes.map(scene => scene.nodes) : [];
        const bufferViews = gltf.bufferViews ? gltf.bufferViews.map(bufferView => BufferView.fromJson(bufferView)) : [];
        const buffers = gltf.buffers ? await Promise.all(gltf.buffers.map(buffer => Buffer.fromJson(buffer))) : [];
        const accessors = gltf.accessors ? gltf.accessors.map(accessor => Accessor.fromJson(accessor, bufferViews, buffers)) : [];
        const images = gltf.images ? await Promise.all(gltf.images.map(image => Image.fromJson(image, bufferViews, buffers))) : [];
        const materials = gltf.materials ? gltf.materials.map(material => Material.fromJson(material, images)) : [];
        const meshes = gltf.meshes ? gltf.meshes.map(mesh => Mesh.fromJson(mesh, accessors, materials)) : [];
        const animations = gltf.animations ? gltf.animations.map((animation, index) => Animation.fromJson(animation, index, accessors)) : [];
        const nodes = gltf.nodes ? gltf.nodes.map((node, index) => Node.fromJson(node, index, gltf.skins ?? [], meshes)) : [];
        const skins = gltf.skins ? gltf.skins.map(skin => Skin.fromJson(skin, accessors, nodes)) : [];

        gltf.nodes?.forEach((node, index) => {
            node.children?.forEach(childIndex => {
                nodes[index].setChild(nodes[childIndex]);
            });
        });

        return new this(defaultScene, scenes, nodes, animations, skins);
    }

    public get scene() : [Object3D, Nullable<Skeleton>, Nullable<Array<AnimationClip>>]
    {
        const scene = this._scenes[this._defaultScene];

        if (undefined === scene)
        {
            throw new Error(`Scene with index "${this._defaultScene}" doesn't exists.`);
        }

        let tree = new Object3D();

        for (let i = 0; i < scene.length; i++)
        {
            tree.setChild(this._nodes[scene[i]]);
        }

        let skeleton = this._skins.length > 0 ? this._skins[0]: null;
        let animations = this._animations.length > 0 ? this._animations : null;

        tree.traverse(object =>
        {
            if (object instanceof SkinnedMesh)
            {
                object.skeleton = skeleton!;
            }
        })

        return [tree, skeleton, animations];
    }
}