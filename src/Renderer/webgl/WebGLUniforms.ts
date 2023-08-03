import {WebGLUniform} from "./WebGLUniform";

export class WebGLUniforms
{
    private readonly uniforms: Map<string, WebGLUniform> = new Map();

    public static create(gl: WebGL2RenderingContext, program: globalThis.WebGLProgram): WebGLUniforms
    {
        const self = new this();
        const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < count; ++i) {
            const info = gl.getActiveUniform(program, i) as WebGLActiveInfo;
            const location = gl.getUniformLocation(program, info.name) as WebGLUniformLocation;

            self.uniforms.set(info.name, new WebGLUniform(gl, info.name, location, info.type));
        }

        return self;
    }

    public get(name: string): WebGLUniform
    {
        if (!this.uniforms.has(name)) {
            throw new Error(`Program doesn't have "${name}" uniform.`)
        }

        return this.uniforms.get(name)!;
    }
}