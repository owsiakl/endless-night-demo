import {WebGLAttribute} from "./WebGLAttribute";

export class WebGLAttributes
{
    private readonly attributes: Map<string, WebGLAttribute> = new Map();

    public static create(gl: WebGL2RenderingContext, program: globalThis.WebGLProgram): WebGLAttributes
    {
        const self = new this();
        const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < count; ++i) {
            const info = gl.getActiveAttrib(program, i) as WebGLActiveInfo;
            const location = gl.getAttribLocation(program, info.name);

            self.attributes.set(info.name, new WebGLAttribute(gl, info.name, location));
        }

        return self;
    }

    public get(name: string): WebGLAttribute
    {
        if (!this.attributes.has(name)) {
            throw new Error(`Program doesn't have "${name}" attribute.`)
        }

        return this.attributes.get(name)!;
    }
}