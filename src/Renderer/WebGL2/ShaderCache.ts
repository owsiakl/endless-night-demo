import {Assets} from "../../Core/Assets";

const VERSION = '#version 300 es';

export class ShaderCache
{
    private readonly _assets: Assets;

    public constructor(assets: Assets)
    {
        this._assets = assets;
    }

    public getVertex(defines: string[]) : string
    {
        return `${VERSION}
        
        ${defines.join('\n')}
        
        ${this._assets.shader('default_vertex')}
        `;
    }

    public getFragment(defines: string[]) : string
    {
        return `${VERSION}
        
        ${defines.join('\n')}
        
        ${this._assets.shader('default_fragment')}
        `;
    }

    public getDepthVertex(defines: string[]) : string
    {
        return `${VERSION}
            
        ${defines.join('\n')}
    
        ${this._assets.shader('depth_vertex')}
        `;
    }

    public getDepthFragment(defines: string[]) : string
    {
        return `${VERSION}
                
        ${defines.join('\n')}

        ${this._assets.shader('depth_fragment')}
        `;
    }

    public getParticleVertex(pass: int) : string
    {
        if (pass === 0)
        {
            return this._assets.shader('particle_emit_vertex');
        }

        if (pass === 1)
        {
            return this._assets.shader('particle_render_vertex');
        }

        throw new Error(`Unrecognized particle vertex pass "${pass}", available are: [0, 1]`);
    }

    public getParticleFragment(pass: int) : string
    {
        if (pass === 0)
        {
            return this._assets.shader('particle_emit_fragment');
        }

        if (pass === 1)
        {
            return this._assets.shader('particle_render_fragment');
        }

        throw new Error(`Unrecognized particle fragment pass "${pass}", available are: [0, 1]`);
    }
}