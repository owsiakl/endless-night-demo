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
}