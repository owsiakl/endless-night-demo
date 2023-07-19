import {ShaderType} from "./ShaderType";
import {Logger} from "../Logger/Logger";

export class Shader
{
    public textContent: string;
    public type: ShaderType;

    public constructor(content: string, type: ShaderType)
    {
        this.textContent = content;
        this.type = type;
    }

    // TODO: probably there is a better place for it. maybe engine?
    public compile(gl: WebGL2RenderingContext, logger: Logger): WebGLShader
    {
        logger.debug(`Compiling shader.`, {'type': this.type, 'content': this.textContent});

        const webglShader = gl.createShader(this.type === ShaderType.VERTEX ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);

        if (null === webglShader) {
            throw new Error(`Can't create shader.`);
        }

        gl.shaderSource(webglShader, this.textContent);
        gl.compileShader(webglShader);

        if (!gl.getShaderParameter(webglShader, gl.COMPILE_STATUS)) {
            throw new Error(`Unexpected error while compiling shader: ` + gl.getShaderInfoLog(webglShader));
        }

        return webglShader;
    }
}