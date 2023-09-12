import {Attribute} from "./Attribute";

export class Attributes
{
    private readonly attributes: Map<string, Attribute> = new Map();

    public static create(gl: WebGL2RenderingContext, program: WebGLProgram): Attributes
    {
        const self = new this();
        const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < count; ++i) {
            const info = gl.getActiveAttrib(program, i) as WebGLActiveInfo;
            const location = gl.getAttribLocation(program, info.name);

            self.attributes.set(info.name, new Attribute(gl, info.name, location));
        }

        return self;
    }

    public get(name: string): Attribute
    {
        if (!this.has(name)) {
            throw new Error(`Program doesn't have "${name}" attribute.`)
        }

        return this.attributes.get(name)!;
    }

    public has(name: string) : boolean
    {
        return this.attributes.has(name);
    }
}