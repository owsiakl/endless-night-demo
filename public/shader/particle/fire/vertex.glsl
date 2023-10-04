#version 300 es

precision mediump float;

uniform float u_time;
uniform mat4 u_projectionView;
uniform mat4 u_model;

in vec3 a_position;

void main()
{
    gl_Position = u_projectionView * u_model * vec4(a_position, 1.0);

    gl_PointSize = 420.0 / gl_Position.w;
}