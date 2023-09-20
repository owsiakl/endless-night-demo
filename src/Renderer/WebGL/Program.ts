import {Uniforms} from "./Uniforms";
import {Attributes} from "./Attributes";
import {Shader} from "./Shader";

export class Program
{
    private cachedUniforms: Uniforms | null = null;
    private cachedAttributes: Attributes | null = null;

    public constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly program: WebGLProgram
    ) {
    }

    public static create(gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string, feedbackVaryings: Array<string> = []): Program
    {
        const program = gl.createProgram();

        if (null === program) {
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

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Unexpected error while creating a program. ' + gl.getProgramInfoLog(program));
        }

        return new this(gl, program);
    }

    public get attributes(): Attributes
    {
        if (null === this.cachedAttributes) {
            this.cachedAttributes = Attributes.create(this.gl, this.program);
        }

        return this.cachedAttributes;
    }

    public get uniforms(): Uniforms
    {
        if (null === this.cachedUniforms) {
            this.cachedUniforms = Uniforms.create(this.gl, this.program);
        }

        return this.cachedUniforms;
    }

    public useProgram()
    {
        this.gl.useProgram(this.program);
    }

    public stopProgram()
    {
        this.gl.useProgram(null);
    }

}