#version 300 es

precision mediump float;

uniform float u_time;
uniform mat4 u_projectionView;
uniform vec3 u_model;

layout(location = 0) in vec3 a_position;
layout(location = 1) in float a_spawnTime;
layout(location = 2) in float a_life;
layout(location = 3) in float a_size;
layout(location = 4) in vec3 a_velocity;
layout(location = 5) in float a_textureUnit;
layout(location = 6) in vec4 a_color;

out float v_textureUnit;
out vec4 v_color;
out vec2 v_rotation;

void main()
{
    float currentLife = a_spawnTime + a_life - u_time;
    float t = 1.0 - currentLife / a_life;

    float size = mix(a_size, 0.6, t);
    vec3 position = a_position + (a_velocity * (t));
    vec4 color = mix(a_color, vec4(0.1, 0.0, 0.0, 0.2), t);

    v_rotation = vec2(cos(t * size), sin(t * size));
    v_color = color;
    v_textureUnit = a_textureUnit;

    gl_Position = u_projectionView * vec4(u_model + position, 1.0);
    gl_PointSize = 100.0 * size / gl_Position.w;
}