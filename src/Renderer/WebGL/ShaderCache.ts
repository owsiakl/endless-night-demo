import {Shaders} from "../../Assets/Shaders";

export class ShaderCache
{
    private readonly fragmentShader: string;
    private readonly vertexShader: string;

    private readonly depthFragmentShader: string;
    private readonly depthVertexShader: string;

    public constructor(shaders: Shaders)
    {
        this.vertexShader = shaders.get('default_vertex').textContent
        this.fragmentShader = shaders.get('default_fragment').textContent
        this.depthVertexShader = shaders.get('depth_vertex').textContent
        this.depthFragmentShader = shaders.get('depth_fragment').textContent
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

    public getDepthVertex(defines: string[]) : string
    {
        const version = '#version 300 es';

        return `${version}
            
        ${defines.join('\n')}
    
        ${this.depthVertexShader}
        `;
    }

    public getDepthFragment(defines: string[]) : string
    {
        const version = '#version 300 es';

        return `${version}
                
        ${defines.join('\n')}

        ${this.depthFragmentShader}
        `;
    }
}