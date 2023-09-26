import {Uniforms} from "./Uniforms";
import {Attributes} from "./Attributes";
import {Shader} from "./Shader";

export class Program
{
    private readonly _gl: WebGL2RenderingContext;
    private readonly _program: WebGLProgram;
    private _cachedUniforms: Nullable<Uniforms>;
    private _cachedAttributes: Nullable<Attributes>;

    public constructor(gl: WebGL2RenderingContext, program: WebGLProgram)
    {
        this._gl = gl;
        this._program = program;
        this._cachedUniforms = null;
        this._cachedAttributes = null;
    }

    public static create(gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string, feedbackVaryings: Array<string> = []) : Program
    {
        const program = gl.createProgram();

        if (null === program)
        {
            throw new Error('Cannot create webgl program.');
        }

        const vShader = Shader.create(gl, gl.VERTEX_SHADER, vertexShader);
        const fShader = Shader.create(gl, gl.FRAGMENT_SHADER, fragmentShader);

        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);

        if (feedbackVaryings.length > 0)
        {
            gl.transformFeedbackVaryings(program, feedbackVaryings, gl.INTERLEAVED_ATTRIBS);
        }

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            throw new Error('Unexpected error while creating a program. ' + gl.getProgramInfoLog(program));
        }

        return new this(gl, program);
    }

    public get attributes() : Attributes
    {
        if (null === this._cachedAttributes)
        {
            this._cachedAttributes = Attributes.create(this._gl, this._program);
        }

        return this._cachedAttributes;
    }

    public get uniforms() : Uniforms
    {
        if (null === this._cachedUniforms)
        {
            this._cachedUniforms = Uniforms.create(this._gl, this._program);
        }

        return this._cachedUniforms;
    }

    public useProgram()
    {
        this._gl.useProgram(this._program);
    }

    public stopProgram()
    {
        this._gl.useProgram(null);
    }
}