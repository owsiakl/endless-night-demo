import {Shaders} from "../../Assets/Shaders";

const VERSION = '#version 300 es';

export class ShaderCache
{
    private readonly _shaders: Shaders;

    public constructor(shaders: Shaders)
    {
        this._shaders = shaders;
    }

    public getVertex(defines: string[]) : string
    {
        return `${VERSION}
        
        ${defines.join('\n')}
        
        ${this._shaders.get('default_vertex').textContent}
        `;
    }

    public getFragment(defines: string[]) : string
    {
        return `${VERSION}
        
        ${defines.join('\n')}
        
        ${this._shaders.get('default_fragment').textContent}
        `;
    }

    public getDepthVertex(defines: string[]) : string
    {
        return `${VERSION}
            
        ${defines.join('\n')}
    
        ${this._shaders.get('depth_vertex').textContent}
        `;
    }

    public getDepthFragment(defines: string[]) : string
    {
        return `${VERSION}
                
        ${defines.join('\n')}

        ${this._shaders.get('depth_fragment').textContent}
        `;
    }

    public getParticleVertex(pass: int) : string
    {
        if (pass === 0)
        {
            return this._shaders.get('particle_emit_vertex').textContent;
        }

        if (pass === 1)
        {
            return this._shaders.get('particle_render_vertex').textContent;
        }

        throw new Error(`Unrecognized particle vertex pass "${pass}", available are: [0, 1]`);
    }

    public getParticleFragment(pass: int) : string
    {
        if (pass === 0)
        {
            return this._shaders.get('particle_emit_fragment').textContent;
        }

        if (pass === 1)
        {
            return this._shaders.get('particle_render_fragment').textContent;
        }

        throw new Error(`Unrecognized particle fragment pass "${pass}", available are: [0, 1]`);
    }
}