#version 300 es

precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main()
{
//    outColor = vec4(0.5, 0.5, 0.5, 1);
    outColor = texture(u_texture, v_texcoord);
}