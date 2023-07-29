import {mat4, quat, vec3} from "gl-matrix";
import {dump} from "../Debug/Numbers";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-node
 */
export class Node
{
    public parent: Node | null = null;
    public children: Array<Node> = [];
    public worldTransform: mat4 = mat4.create();

    private constructor(
        public name: string | undefined,
        public index: number,
        public translation: vec3,
        public rotation: quat,
        public scale: vec3,
        public mesh: number | undefined,
        public skin: number | undefined,
    ) {
    }

    public static fromJson(index: number, nodesList: Array<GLTF_node>): Node
    {
        const node = nodesList[index];

        return new this(
            node.name,
            index,
            node.translation ? vec3.fromValues(...node.translation) : vec3.fromValues(0, 0, 0),
            node.rotation ? quat.fromValues(...node.rotation) : quat.fromValues(0, 0, 0, 1),
            node.scale ? vec3.fromValues(...node.scale) : vec3.fromValues(1, 1, 1),
            node.mesh,
            node.skin,
        );
    }

    public setParent(parent: Node) : void
    {
        if (null !== this.parent) {
            throw new Error(`Parent for node "${this.name}" was already defined.`);
        }

        parent.setChild(this);
        this.parent = parent;
    }

    public setChild(child: Node) : void
    {
        this.children.push(child);
    }

    public applyTransforms(parentTransform: mat4)
    {
        mat4.multiply(this.worldTransform, parentTransform, this.localTransform);

        for (const children of this.children) {
            children.applyTransforms(this.worldTransform);
        }
    }

    get localTransform(): mat4
    {
        return mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.translation, this.scale);
    }

    public get isMesh(): boolean
    {
        return undefined !== this.mesh;
    }
}