import {Material} from "./Material";

export class ShaderMaterial extends Material
{
    public readonly vertex: string;
    public readonly fragment: string;
    public readonly uniforms: Map<string, any>;

    public constructor(vertex: string, fragment: string)
    {
        super();

        this.vertex = vertex;
        this.fragment = fragment;
        this.uniforms = new Map();
    }
}