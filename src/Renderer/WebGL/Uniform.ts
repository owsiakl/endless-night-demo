export class Uniform
{
    private readonly _gl: WebGL2RenderingContext;
    private readonly _name: string;
    private readonly _location: WebGLUniformLocation;
    private readonly _type: GLenum;
    private readonly _size: number;

    public constructor(gl: WebGL2RenderingContext, name: string, location: WebGLUniformLocation, type: GLenum, size: number)
    {
        this._gl = gl;
        this._name = name;
        this._location = location;
        this._type = type;
        this._size = size;
    }

    public set(data: any) : void
    {
        switch (this._type)
        {
            case 35676: this._gl.uniformMatrix4fv(this._location, false, data); break;
            case 35675: this._gl.uniformMatrix3fv(this._location, false, data); break;
            case 35665: this._gl.uniform3fv(this._location, data); break;
            case 35678: this._gl.uniform1i(this._location, data); break;
            case 35680: this._gl.uniform1i(this._location, data); break;
            case 5126: this._gl.uniform1f(this._location, data); break;
            case 5124: this._gl.uniform1i(this._location, data); break;
            case 35682: this._gl.uniform1i(this._location, data); break;
            default: throw new Error(`Cannot set uniform value - unrecognized type "${this._type}".`);
        }
    }
}