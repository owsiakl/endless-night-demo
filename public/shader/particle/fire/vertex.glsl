#version 300 es

uniform float u_time;
uniform mat4 u_projectionView;
uniform mat4 u_model;
uniform vec2 u_resolution;

in vec3 a_position;

void main()
{
    gl_Position = u_projectionView * u_model * vec4(a_position, 1.0);
    gl_PointSize = 0.5 / gl_Position.w * u_resolution.y;
}