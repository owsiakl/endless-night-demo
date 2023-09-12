import {Uniform} from "./Uniform";

export class Uniforms
{
    private readonly uniforms: Map<string, Uniform> = new Map();

    public static create(gl: WebGL2RenderingContext, program: WebGLProgram): Uniforms
    {
        const self = new this();
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < count; ++i) {
            const info = gl.getActiveUniform(program, i) as WebGLActiveInfo;
            const location = gl.getUniformLocation(program, info.name) as WebGLUniformLocation;

            let name = info.name;

            if (name.endsWith('[0]')) {
                name = name.slice(0, -3)
            }

            self.uniforms.set(name, new Uniform(gl, name, location, info.type, info.size));
        }

        return self;
    }

    public get(name: string): Uniform
    {
        if (!this.uniforms.has(name)) {
            throw new Error(`Program doesn't have "${name}" uniform.`)
        }

        return this.uniforms.get(name)!;
    }

    public has(name: string): boolean
    {
        return this.uniforms.has(name);
    }
}