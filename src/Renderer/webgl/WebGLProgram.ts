import {WebGLUniforms} from "./WebGLUniforms";
import {WebGLAttributes} from "./WebGLAttributes";
import {WebGLShader} from "./WebGLShader";

export class WebGLProgram
{
    private cachedUniforms: WebGLUniforms | null = null;
    private cachedAttributes: WebGLAttributes | null = null;

    public constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly program: globalThis.WebGLProgram
    ) {
    }

    public static create(gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string): WebGLProgram
    {
        const program = gl.createProgram();

        if (null === program) {
            throw new Error('Cannot create webgl program.');
        }

        const vShader = WebGLShader.create(gl, gl.VERTEX_SHADER, vertexShader);
        const fShader = WebGLShader.create(gl, gl.FRAGMENT_SHADER, fragmentShader);

        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Unexpected error while creating a program.' + gl.getProgramInfoLog(program));
        }

        return new this(gl, program);
    }

    public get attributes(): WebGLAttributes
    {
        if (null === this.cachedAttributes) {
            this.cachedAttributes = WebGLAttributes.create(this.gl, this.program);
        }

        return this.cachedAttributes;
    }

    public get uniforms(): WebGLUniforms
    {
        if (null === this.cachedUniforms) {
            this.cachedUniforms = WebGLUniforms.create(this.gl, this.program);
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