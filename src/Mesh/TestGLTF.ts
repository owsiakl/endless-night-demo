import { Camera } from "../Engine/Camera";
import { Program } from "../Engine/Program";
import {Mesh} from "./Mesh";
import {Loader} from "../GLTF/Loader";
import {Assets} from "../Assets/Assets";
import {mat4} from "gl-matrix";

export class TestGLTF implements Mesh
{
    private gl: WebGL2RenderingContext;
    private program: Program;
    private vao: WebGLVertexArrayObject | null;
    private model: Loader;
    private vertexCount: number;
    private assets: Assets;

    constructor(program: Program, gl: WebGL2RenderingContext, model: Loader, assets: Assets)
    {
        this.gl = gl;
        this.program = program;
        this.vao = null;
        this.model = model;
        this.vertexCount = 0;
        this.assets = assets;
    }

    preRender(camera: Camera): void
    {
        this.program.setAttributeLocation('a_position');
        this.program.setAttributeLocation('a_texcoord');
        this.program.setAttributeLocation('a_joint');
        this.program.setAttributeLocation('a_weight');
        this.program.setUniformLocation('u_projection');
        this.program.setUniformLocation('u_view');
        this.program.setUniformLocation('u_model');
        this.program.setUniformLocation('u_jointMat');

        this.vao = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.vao);

        const mesh = this.model.meshes[0];
        const skin = this.model.skins![0];
        const accessors = this.model.accessors;
        const bufferViews = this.model.bufferViews;
        const buffers = this.model.buffers;

        // POSITIONS
        {
            const accessor = accessors[mesh.primitive.position];
            const bufferView = bufferViews[accessor.bufferView];

            if (undefined != bufferView.target) {
                const positionBuffer = this.gl.createBuffer();
                const positions = this.model.getAccessorData(mesh.primitive.position);

                this.gl.bindBuffer(bufferView.target, positionBuffer);
                this.gl.bufferData(bufferView.target, positions, this.gl.STATIC_DRAW);
                this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_position'));
                this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_position'), accessor.typeSize, accessor.componentType, false, 0, 0);
            }
        }

        // JOINTS
        if (undefined !== mesh.primitive.joints) {
            const jointAccessor = this.model.accessors[mesh.primitive.joints];
            const joints = this.model.getAccessorData(mesh.primitive.joints);

            const jointsBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, jointsBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, joints, this.gl.STATIC_DRAW);
            this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_joint'));
            this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_joint'), jointAccessor.typeSize, jointAccessor.componentType, false, 0, 0);
        }

        // WEIGHTS
        if (undefined !== mesh.primitive.weights) {
            const weightAccessor = this.model.accessors[mesh.primitive.weights];
            const weights = this.model.getAccessorData(mesh.primitive.weights);

            const weightBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, weightBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, weights, this.gl.STATIC_DRAW);
            this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_weight'));
            this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_weight'), weightAccessor.typeSize, weightAccessor.componentType, false, 0, 0);
        }

        // INDICES
        if (undefined !== mesh.primitive.indices) {
            const accessor = accessors[mesh.primitive.indices];
            const bufferView = bufferViews[accessor.bufferView];

            if (undefined != bufferView.target) {
                const indicesBuffer = this.gl.createBuffer();
                const indices = this.model.getAccessorData(mesh.primitive.indices);

                this.gl.bindBuffer(bufferView.target, indicesBuffer);
                this.gl.bufferData(bufferView.target, indices, this.gl.STATIC_DRAW);
            }

            this.vertexCount = accessor.count;
        }

        // TEXCOORDS
        if (undefined !== mesh.primitive.texCoord) {
            const accessor = accessors[mesh.primitive.texCoord];
            const bufferView = bufferViews[accessor.bufferView];

            if (undefined != bufferView.target) {
                const texCoordsBuffer = this.gl.createBuffer();
                const texCoords = this.model.getAccessorData(mesh.primitive.texCoord);

                this.gl.bindBuffer(bufferView.target, texCoordsBuffer);
                this.gl.bufferData(bufferView.target, texCoords, this.gl.STATIC_DRAW);
                this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_texcoord'));
                this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_texcoord'), accessor.typeSize, accessor.componentType, false, 0, 0);
            }
        }

        // TEXTURES
        if (undefined !== mesh.primitive.material) {
            const material = this.model.materials![mesh.primitive.material]

            if (material.isTexture) {
                const texture = this.model.texture![material.baseTexture!]
                const image = this.model.images![texture.source];

                let imageFile: HTMLImageElement | undefined = undefined;

                if (image.isFromFile) {
                    imageFile = this.assets.images.get(image.uri!);

                    const modelTexture = this.gl.createTexture();
                    this.gl.bindTexture(this.gl.TEXTURE_2D, modelTexture);
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageFile);
                    this.gl.generateMipmap(this.gl.TEXTURE_2D);
                }

                if (image.isFromBuffer) {
                    const bufferView = bufferViews[image.bufferView!];
                    const buffer = buffers[bufferView.buffer];
                    const imageData = new Uint8Array(buffer.arrayBuffer(), bufferView.byteOffset, bufferView.byteLength / Uint8Array.BYTES_PER_ELEMENT);
                    const blob = new Blob([imageData], {type: image.mimeType});

                    imageFile = new Image();
                    imageFile.onload = () => {
                        const modelTexture = this.gl.createTexture();
                        this.gl.bindTexture(this.gl.TEXTURE_2D, modelTexture);
                        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageFile!);
                        this.gl.generateMipmap(this.gl.TEXTURE_2D);
                    };
                    imageFile.src = URL.createObjectURL(blob);
                }
            }
        }

        // SKINS
        if (undefined !== this.model.skins) {
            const ibmAccessor = this.model.accessors[skin.inverseBindMatrices];
            const ibm = this.model.getAccessorData(skin.inverseBindMatrices);

            skin.joints.forEach((joint, index) => {
                joint.ibm = ibm.slice(index * ibmAccessor.typeSize, (index + 1) * ibmAccessor.typeSize) as mat4;
            });
        }

        this.gl.bindVertexArray(null);

        this.gl.useProgram(this.program.program);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_projection'), false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_view'), false, camera.viewMatrix);
        this.gl.useProgram(null);
    }

    render(time: number, camera: Camera): void
    {
        this.gl.useProgram(this.program.program);
        this.gl.bindVertexArray(this.vao);

        const animation = this.model.animations![1];
        const scene = this.model.scenes[0];

        animation.advance(time);
        scene.applyTransforms();

        if (undefined !== this.model.skins) {
            for (const skin of this.model.skins) {
                for (const joint of skin.joints) {
                    const node = this.model.nodes[joint.index];

                    joint.jointMatrix = mat4.clone(node.worldTransform);
                    mat4.multiply(joint.jointMatrix, joint.jointMatrix, joint.ibm);
                }

                this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_jointMat'), false, skin.jointMatrix);
            }
        }

        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_view'), false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_model'), false, mat4.create());

        this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);

        this.gl.useProgram(null);
        this.gl.bindVertexArray(null);
    }
}