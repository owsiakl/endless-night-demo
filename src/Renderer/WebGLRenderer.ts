import {Camera} from "../Engine/Camera";
import {Scene} from "../Core/Scene";
import {mat4} from "gl-matrix";
import {Line} from "../Core/Object/Line";
import {Mesh} from "../Core/Object/Mesh";
import {WebGLPrograms} from "./webgl/WebGLPrograms";
import {WebGLVertexArrays} from "./webgl/WebGLVertexArrays";

export class WebGLRenderer
{
    private readonly programs = new WebGLPrograms();
    private readonly vertexArrays = new WebGLVertexArrays();

    public constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly gl: WebGL2RenderingContext
    ) {
    }

    public render(scene: Scene, camera: Camera)
    {
        const gl = this.gl;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        for (let i = 0, length = scene.objects.length; i < length; i++) {
            const object = scene.objects[i];
            const geometry = object.geometry;
            const program = this.programs.initProgram(gl, object.material);

            program.useProgram();
            this.vertexArrays.bind(gl, geometry.id);

            if (geometry.updateBuffers) {
                for (let i = 0, length = geometry.attributes.length; i < length; i++) {
                    const attribute = geometry.attributes[i];

                    program.attributes.get(attribute.name).set(attribute.data, gl.ARRAY_BUFFER, attribute.normalized);
                }

                if (geometry.indexed) {
                    const buffer = gl.createBuffer();

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);
                }

                geometry.updateBuffers = false;

                // @ts-ignore
                program.uniforms.get('u_projection').set(camera.projectionMatrix);
            }

            // @ts-ignore
            program.uniforms.get('u_model').set(mat4.create());
            // @ts-ignore
            program.uniforms.get('u_view').set(camera.viewMatrix);


            let mode = null;

            if (object instanceof Line) {
                mode = this.gl.LINES;
            }

            if (object instanceof Mesh) {
                mode = this.gl.TRIANGLES;
            }

            if (null === mode) {
                throw new Error('Cannot get rendering mode.');
            }

            if (geometry.indexed) {
                gl.drawElements(mode, geometry.count, gl.UNSIGNED_SHORT, 0);
            } else {
                gl.drawArrays(mode, 0, geometry.count);
            }

            this.vertexArrays.unbind(gl);
            program.stopProgram();
        }
    }
}