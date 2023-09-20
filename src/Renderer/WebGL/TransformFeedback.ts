import {Program} from "./Program";
import {Particle} from "../../Core/Object/Particle";

export class TransformFeedback
{
    private readonly _updateProgram: Program;
    private readonly _renderProgram: Program;

    private readonly _buffers: Array<WebGLBuffer>;
    private readonly _vertexArrayObjects: Array<WebGLVertexArrayObject>;

    private _srcBufferIndex: float;
    private _dstBufferIndex: float;

    public constructor(updateProgram: Program, renderProgram: Program)
    {
        this._updateProgram = updateProgram;
        this._renderProgram = renderProgram;

        this._srcBufferIndex = 0;
        this._dstBufferIndex = 1;
        this._buffers = [];
        this._vertexArrayObjects = [];
    }

    public static create(gl: WebGL2RenderingContext, particles: Particle, updateProgram: Program, renderProgram: Program) : TransformFeedback
    {
        const self = new this(updateProgram, renderProgram);
        const programs = [updateProgram, renderProgram];
        const data = particles.allocateData;

        for (let i = 0; i < 2; i++)
        {
            const program = programs[i];
            const vao = gl.createVertexArray()!

            gl.bindVertexArray(vao);
            const buffer = program.attributes.setInterleaved(data, particles.geometry.attributes, gl.ARRAY_BUFFER, gl.DYNAMIC_COPY);
            gl.bindVertexArray(null);

            self._buffers.push(buffer);
            self._vertexArrayObjects.push(vao);
        }

        return self;
    }

    public preUpdate(gl: WebGL2RenderingContext)
    {
        this._updateProgram.useProgram();
        gl.bindVertexArray(this._srcVertexArrayObject);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._dstBuffer);
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);
    }

    public postUpdate(gl: WebGL2RenderingContext)
    {
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

        this._switchBuffers();
    }

    public preRender(gl: WebGL2RenderingContext)
    {
        this._renderProgram.useProgram();
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(this._dstVertexArrayObject);
    }

    public postRender(gl: WebGL2RenderingContext)
    {
        gl.bindVertexArray(null);
        gl.blendFunc(gl.ONE, gl.ZERO);
        gl.enable(gl.DEPTH_TEST);
        this._renderProgram.stopProgram();
    }

    private get _srcVertexArrayObject() : WebGLVertexArrayObject
    {
        return this._vertexArrayObjects[this._srcBufferIndex];
    }

    private get _dstVertexArrayObject() : WebGLVertexArrayObject
    {
        return this._vertexArrayObjects[this._dstBufferIndex];
    }

    private get _dstBuffer() : WebGLBuffer
    {
        return this._buffers[this._dstBufferIndex];
    }

    private _switchBuffers() : void
    {
        this._srcBufferIndex = (this._srcBufferIndex + 1) % 2;
        this._dstBufferIndex = (this._dstBufferIndex + 1) % 2;
    }
}