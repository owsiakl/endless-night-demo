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

            let name = info.name;

            if (name.endsWith('[0]')) {
                name = name.slice(0, -3)
            }

            self.uniforms.set(name, new WebGLUniform(gl, name, location, info.type, info.size));
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