export function printUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): void
{
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for(let i = 0; i < uniformCount; ++i) {
        const info = gl.getActiveUniform(program, i) as WebGLActiveInfo;
        const loc = gl.getUniformLocation(program, info.name);

        console.log(info, loc);
    }
}

export function printAttributes(gl: WebGL2RenderingContext, program: WebGLProgram): void
{
    const attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for(let i = 0; i < attribCount; ++i) {
        const info = gl.getActiveAttrib(program, i) as WebGLActiveInfo;
        const loc = gl.getAttribLocation(program, info.name);

        console.log(info, loc);
    }
}