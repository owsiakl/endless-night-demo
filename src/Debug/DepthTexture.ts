export class DepthTexture
{
    private constructor(
        private readonly gl: WebGL2RenderingContext,
        private readonly program: WebGLProgram,
        private readonly width: int,
        private readonly height: int,
        private readonly vao: WebGLVertexArrayObject,
    ) {
    }

    public static create(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, size: int = 800) : DepthTexture
    {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const clipWidth  = size  / canvasWidth;
        const clipHeight = size / canvasHeight;

        const vSource = `#version 300 es
            layout (location = 0) in vec4 a_position;
            layout (location = 1) in vec2 a_texcoord;
            
            out vec2 v_texcoord;

            void main()
            {
                gl_Position = a_position;
                v_texcoord = a_texcoord;
            }
      `;

        const fSource = `#version 300 es
            precision highp float;
            
            uniform sampler2D u_texture;

            in vec2 v_texcoord;
            out vec4 outColor;
          
            float near = 0.1;
            float far  = 30.0;
            
            float linearizeDepth(float depth)
            {
                float z = depth * 2.0 - 1.0;
                return (2.0 * near * far) / (far + near - z * (far - near));
            }
            
            void main()
            {
                float depthValue = texture(u_texture, v_texcoord).r;

                // for orthographic
                outColor = vec4(vec3(depthValue), 1.0);
    
                // for perspective
                // outColor = vec4(vec3(linearizeDepth(depthValue) / far), 1.0);
            }
      `;

        const vShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        gl.shaderSource(vShader, vSource);
        gl.compileShader(vShader);

        const fShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(fShader, fSource);
        gl.compileShader(fShader);

        const program = gl.createProgram() as WebGLProgram;
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            throw new Error(`Cannot link the program: ${gl.getProgramInfoLog(program)}.`);
        }

        const vao = gl.createVertexArray() as WebGLVertexArrayObject;
        gl.bindVertexArray(vao);

        // ===== POSITIONS =====
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            1.0,              1.0,
            1.0 - clipWidth,  1.0,
            1.0,              1.0 - clipHeight,
            1.0 - clipWidth,  1.0 - clipHeight,
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // ===== TEXTURE COORDINATES =====
        const texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            1,1,
            0,1,
            1,0,
            0,0,
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);

        return new DepthTexture(gl, program, canvasWidth, canvasHeight, vao);
    }

    public draw(texture: WebGLTexture) : void
    {
        const gl = this.gl;

        gl.viewport(0, 0, this.width, this.height)

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        gl.activeTexture(WebGL2RenderingContext.TEXTURE0);
        gl.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);

        gl.drawArrays(WebGL2RenderingContext.TRIANGLE_STRIP, 0, 4);

        gl.bindVertexArray(null);
        gl.useProgram(null);
    }
}