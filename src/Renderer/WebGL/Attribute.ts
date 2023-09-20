import {GeometryAttribute} from "../../Core/GeometryAttribute";

export class Attribute
{
    public readonly location: GLuint;

    private readonly _gl: WebGL2RenderingContext;
    private readonly _name: string;

    public constructor(gl: WebGL2RenderingContext, name: string, location: GLuint)
    {
        this.location = location;
        this._gl = gl;
        this._name = name;
    }

    public set(attribute: GeometryAttribute, target: GLint = this._gl.ARRAY_BUFFER) : void
    {
        const gl = this._gl;
        const buffer = gl.createBuffer();

        if (null === buffer)
        {
            throw new Error('Cannot create webgl buffer.');
        }

        const type = (() => {
            switch (true) {
                case attribute.data instanceof Int8Array: return gl.BYTE;
                case attribute.data instanceof Uint8Array: return gl.UNSIGNED_BYTE;
                case attribute.data instanceof Int16Array: return gl.SHORT;
                case attribute.data instanceof Uint16Array: return gl.UNSIGNED_SHORT;
                case attribute.data instanceof Int32Array: return gl.INT;
                case attribute.data instanceof Uint32Array: return gl.UNSIGNED_INT;
                case attribute.data instanceof Float32Array: return gl.FLOAT;
                default: throw new Error('Cannot infer data type from array.');
            }
        })();

        gl.bindBuffer(target, buffer);
        gl.bufferData(target, attribute.data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.location);
        gl.vertexAttribPointer(this.location, attribute.itemSize, type, attribute.normalized, 0, 0);
        gl.bindBuffer(target, null);
    }
}