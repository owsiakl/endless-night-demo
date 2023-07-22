import {Logger} from "../Logger/Logger";
import {Shader} from "../Assets/Shader";

export class Program
{
    private attributes: Map<string, GLuint>;
    private uniforms: Map<string, WebGLUniformLocation>;

    private constructor(private name: string, private gl: WebGL2RenderingContext, private logger: Logger, public program: WebGLProgram)
    {
        this.attributes = new Map();
        this.uniforms = new Map();
    }

    public static create(name: string, vertexShader: Shader, fragmentShader: Shader, gl: WebGL2RenderingContext, logger: Logger): Program
    {
        logger.debug(`Creating program "${name}".`);

        const program = gl.createProgram();

        if (null === program) {
            throw new Error(`Can't create program "${name}"`);
        }

        gl.attachShader(program, vertexShader.compile(gl, logger));
        gl.attachShader(program, fragmentShader.compile(gl, logger));
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(`Unexpected error while creating a program "${name}".` + gl.getProgramInfoLog(program));
        }

        logger.debug(`Program "${name}" shader attached & program linked.`);

        return new this(name, gl, logger, program);
    }

    public getAttributeLocation(attribute: string): GLuint
    {
        if (!this.attributes.has(attribute)) {
            throw new Error(`Program doesn't have "${attribute}" attribute location.`);
        }

        return this.attributes.get(attribute)!;
    }

    public setAttributeLocation(attribute: string): void
    {
        if (this.attributes.has(attribute)) {
            throw new Error(`Program already have set "${attribute}" attribute location.`);
        }

        const location = this.gl.getAttribLocation(this.program, attribute);

        if (location < 0) {
            throw new Error(`Program "${this.name}" doesn't have "${attribute}" attribute or it's not used. (location ${location})`);
        }

        this.logger.debug(`Set program "${this.name}" attribute location "${attribute}".`, {'location': location});

        this.attributes.set(attribute, location);
    }

    public getUniformLocation(uniform: string): WebGLUniformLocation
    {
        if (!this.uniforms.has(uniform)) {
            throw new Error(`Program doesn't have "${uniform}" uniform location.`);
        }

        return this.uniforms.get(uniform)!;
    }

    public setUniformLocation(uniform: string): void
    {
        if (this.uniforms.has(uniform)) {
            throw new Error(`Program already have set "${uniform}" uniform location.`);
        }

        const location = this.gl.getUniformLocation(this.program, uniform);

        if (null === location) {
            throw new Error(`Program "${this.name}" doesn't have "${uniform}" uniform or it's not used. (location ${location})`);
        }

        this.logger.debug(`Set program "${this.name}" uniform "${uniform}" location.`, {'location': location});

        this.uniforms.set(uniform, location);
    }
}