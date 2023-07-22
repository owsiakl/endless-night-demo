#version 300 es

in vec3 a_position;
layout(location=4) in float a_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
uniform vec3 u_color[4];

out lowp vec4 v_color;

void main()
{
    v_color = vec4(u_color[int(a_color)], 1.0);
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}