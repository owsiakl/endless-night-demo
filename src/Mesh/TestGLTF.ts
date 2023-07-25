import { Camera } from "../Engine/Camera";
import { Program } from "../Engine/Program";
import {Mesh} from "./Mesh";
import {Loader} from "../GLTF/Loader";
import {Assets} from "../Assets/Assets";

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
        this.program.setUniformLocation('u_projection');
        this.program.setUniformLocation('u_view');

        this.vao = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.vao);


        // const scene = this.model.scenes[this.model.defaultScene];
        // const node = this.model.nodes[scene.node];
        //
        // if (!node.isMesh) {
        //     throw new Error('GLTF model is not a mesh.');
        // }

        const mesh = this.model.meshes[0];
        const accessors = this.model.accessors;
        const bufferViews = this.model.bufferViews;
        const buffers = this.model.buffers;

        // POSITIONS
        {
            const accessor = accessors[mesh.primitive.position];
            const bufferView = bufferViews[accessor.bufferView];
            const buffer = buffers[bufferView.buffer];
            const TypedArray = accessor.typedArray;

            if (undefined != bufferView.target) {
                const positionBuffer = this.gl.createBuffer();
                const positions = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset, bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT);

                this.gl.bindBuffer(bufferView.target, positionBuffer);
                this.gl.bufferData(bufferView.target, positions, this.gl.STATIC_DRAW);
                this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_position'));
                this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_position'), accessor.typeSize, accessor.componentType, false, bufferView.byteStride, accessor.byteOffset);
            }
        }

        // INDICES
        if (undefined !== mesh.primitive.indices) {
            const accessor = accessors[mesh.primitive.indices];
            const bufferView = bufferViews[accessor.bufferView];
            const buffer = buffers[bufferView.buffer];
            const TypedArray = accessor.typedArray;

            if (undefined != bufferView.target) {
                const indicesBuffer = this.gl.createBuffer();
                const indices = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset, bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT);

                this.gl.bindBuffer(bufferView.target, indicesBuffer);
                this.gl.bufferData(bufferView.target, indices, this.gl.STATIC_DRAW);
            }

            this.vertexCount = accessor.count;
        }

        if (undefined !== mesh.primitive.texCoord) {
            const accessor = accessors[mesh.primitive.texCoord];
            const bufferView = bufferViews[accessor.bufferView];
            const buffer = buffers[bufferView.buffer];
            const TypedArray = accessor.typedArray;

            if (undefined != bufferView.target) {
                const texCoordsBuffer = this.gl.createBuffer();
                const texCoords = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset, bufferView.byteLength / TypedArray.BYTES_PER_ELEMENT);

                this.gl.bindBuffer(bufferView.target, texCoordsBuffer);
                this.gl.bufferData(bufferView.target, texCoords, this.gl.STATIC_DRAW);
                this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_texcoord'));
                this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_texcoord'), accessor.typeSize, accessor.componentType, false, bufferView.byteStride, accessor.byteOffset);
            }
        }

        if (undefined !== mesh.primitive.material) {
            const material = this.model.materials[mesh.primitive.material]

            if (material.isTexture) {

                const texture = this.model.texture![material.baseTexture!]
                const sampler = this.model.samplers![texture.sampler];
                const image = this.model.images![texture.source];

                let imageFile: HTMLImageElement|undefined = undefined;

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

        this.gl.uniformMatrix4fv(this.program.getUniformLocation('u_view'), false, camera.viewMatrix);

        this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);

        this.gl.useProgram(null);
        this.gl.bindVertexArray(null);
    }
}