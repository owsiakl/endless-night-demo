#version 300 es

precision lowp float;

uniform sampler2D u_texture;

in float v_textureUnit;
in vec4 v_color;
in vec2 v_rotation;

out vec4 outColor;

void main()
{
    vec2 coords = gl_PointCoord;

    coords = (coords - 0.5) * mat2(v_rotation.x, v_rotation.y, -v_rotation.y, v_rotation.x) + 0.5;
    coords.x = (coords.x / 3.0) + (1.0 / 3.0 * v_textureUnit);

    outColor = texture(u_texture, coords) * v_color;
    outColor.xyz *= (outColor.w * 1.4);
    outColor.w *= 1.1;
}