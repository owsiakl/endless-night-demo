import { Camera } from "../Engine/Camera";
import { Program } from "../Engine/Program";
import {Mesh} from "./Mesh";
import {Loader} from "../GLTF/Loader";

export class TestGLTF implements Mesh
{
    private gl: WebGL2RenderingContext;
    private program: Program;
    private vao: WebGLVertexArrayObject | null;
    private model: Loader;
    private vertexCount: number;

    constructor(program: Program, gl: WebGL2RenderingContext, model: Loader)
    {
        this.gl = gl;
        this.program = program;
        this.vao = null;
        this.model = model;
        this.vertexCount = 0;
    }

    preRender(camera: Camera): void
    {
        this.program.setAttributeLocation('a_position');
        this.program.setUniformLocation('u_projection');
        this.program.setUniformLocation('u_view');

        this.vao = this.gl.createVertexArray()!;
        this.gl.bindVertexArray(this.vao);


        const scene = this.model.scenes[this.model.defaultScene];
        const node = this.model.nodes[scene.node];

        if (!node.isMesh) {
            throw new Error('GLTF model is not a mesh.');
        }

        const mesh = this.model.meshes[node.mesh!];
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
                const positions = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset, accessor.typeSize * accessor.count);

                this.gl.bindBuffer(bufferView.target, positionBuffer);
                this.gl.bufferData(bufferView.target, positions, this.gl.STATIC_DRAW);
                this.gl.enableVertexAttribArray(this.program.getAttributeLocation('a_position'));
                this.gl.vertexAttribPointer(this.program.getAttributeLocation('a_position'), accessor.typeSize, accessor.componentType, false, 0, 0);
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
                const indices = new TypedArray(buffer.arrayBuffer(), bufferView.byteOffset, accessor.typeSize * accessor.count)

                this.gl.bindBuffer(bufferView.target, indicesBuffer);
                this.gl.bufferData(bufferView.target, indices, this.gl.STATIC_DRAW);
            }

            this.vertexCount = accessor.count;
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