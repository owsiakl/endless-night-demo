import {Shaders} from "../../Assets/Shaders";

export class WebGLShaderCache
{
    private readonly fragmentShader: string;
    private readonly vertexShader: string;

    public constructor(shaders: Shaders)
    {
        this.vertexShader = shaders.get('default_vertex').textContent
        this.fragmentShader = shaders.get('default_fragment').textContent
    }

    public getVertex(defines: string[]) : string
    {
        const version = '#version 300 es';

        return `${version}
        
        ${defines.join('\n')}
        
        ${this.vertexShader}
        `;
    }

    public getFragment(defines: string[]) : string
    {
        const version = '#version 300 es';

        return `${version}
        
        ${defines.join('\n')}
        
        ${this.fragmentShader}
        `;
    }
}