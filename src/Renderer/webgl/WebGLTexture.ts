import {Object3D} from "../../Core/Object3D";
import {Line} from "../../Core/Object/Line";
import {Mesh} from "../../Core/Object/Mesh";

export class WebGLTexture
{
    public textures: Map<number, globalThis.WebGLTexture> = new Map();

    private currentTextureUnit = 0;

    public set(gl: WebGL2RenderingContext, object: Mesh | Line)
    {

        if (!object.material || !object.material.image) {
            return;
        }

        const texture = gl.createTexture();

        if (null === texture)
        {
            throw new Error('Cannot create webgl texture.');
        }

        gl.activeTexture(gl.TEXTURE0 + this.currentTextureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, object.material.image);
        gl.generateMipmap(gl.TEXTURE_2D);


        this.textures.set(object.geometry.id, texture);

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.currentTextureUnit++;
    }
}