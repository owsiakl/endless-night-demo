import {Attribute} from "./Attribute";
import {GeometryAttribute} from "../../Core/GeometryAttribute";

export class Attributes
{
    private readonly _gl: WebGL2RenderingContext;
    private readonly _attributes: Map<string, Attribute>;

    private constructor(gl: WebGL2RenderingContext)
    {
        this._gl = gl;
        this._attributes = new Map();
    }

    public static create(gl: WebGL2RenderingContext, program: WebGLProgram) : Attributes
    {
        const self = new this(gl);
        const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < count; ++i)
        {
            const info = gl.getActiveAttrib(program, i) as WebGLActiveInfo;
            const location = gl.getAttribLocation(program, info.name);

            self._attributes.set(info.name, new Attribute(gl, info.name, location));
        }

        return self;
    }

    public get(name: string) : Attribute
    {
        if (!this.has(name))
        {
            throw new Error(`Program doesn't have "${name}" attribute.`)
        }

        return this._attributes.get(name)!;
    }

    public has(name: string) : boolean
    {
        return this._attributes.has(name);
    }

    public setInterleaved(data: TypedArray, attributes: Array<GeometryAttribute>, target: GLint = this._gl.ARRAY_BUFFER, usage: GLint = this._gl.STATIC_DRAW) : WebGLBuffer
    {
        const gl = this._gl;
        const buffer = gl.createBuffer();

        if (null === buffer)
        {
            throw new Error('Cannot create webgl buffer.');
        }

        const type = (() => {
            switch (true) {
                case data instanceof Int8Array: return gl.BYTE;
                case data instanceof Uint8Array: return gl.UNSIGNED_BYTE;
                case data instanceof Int16Array: return gl.SHORT;
                case data instanceof Uint16Array: return gl.UNSIGNED_SHORT;
                case data instanceof Int32Array: return gl.INT;
                case data instanceof Uint32Array: return gl.UNSIGNED_INT;
                case data instanceof Float32Array: return gl.FLOAT;
                default: throw new Error('Cannot infer data type from array.');
            }
        })();

        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, usage);

        let stride = 0;
        for (let i = 0, length = attributes.length; i < length; i++)
        {
            stride += (data.BYTES_PER_ELEMENT * attributes[i].itemSize);
        }

        let offset = 0;
        for (let i = 0, length = attributes.length; i < length; i++)
        {
            const attribute = attributes[i];

            if (this.has(attribute.name))
            {
                const location = this.get(attribute.name).location;

                console.log(location, attribute.itemSize, type, attribute.normalized);

                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, attribute.itemSize, type, attribute.normalized, 0, 0);

                offset += (data.BYTES_PER_ELEMENT * attribute.itemSize);
            }
            else
            {
                // throw new Error(`Program doesn't have attribute "${attribute.name}" so it cannot be set.`);
            }
        }

        gl.bindBuffer(target, null);

        return buffer;
    }
}