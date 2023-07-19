document.addEventListener('DOMContentLoaded', main)

function main()
{
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');

    const vsSource = `#version 300 es
        in vec4 a_position;
        
        void main()
        {
            gl_Position = a_position;
        }
    `;

    const fsSource = `#version 300 es
        precision highp float;
        
        out vec4 outColor;
        
        void main()
        {
            outColor = vec4(1, 0, 0.5, 1);
        }
    `;

    // SHADER
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader));
    }

    // PROGRAM
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program));
    }

    // POSITIONS
    const positionAttrLoc = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,   0,0.5,   0.7,0]), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttrLoc);
    gl.vertexAttribPointer(
        positionAttrLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0,
    );

    gl.bindVertexArray(null);

    // DRAW
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}