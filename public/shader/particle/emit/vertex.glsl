#version 300 es

precision highp float;

uniform float u_time;

layout(location = 0) in vec3 a_position;
layout(location = 1) in float a_spawnTime;
layout(location = 2) in float a_life;
layout(location = 3) in float a_size;
layout(location = 4) in vec3 a_velocity;
layout(location = 5) in float a_textureUnit;
layout(location = 6) in vec4 a_color;

out vec3 v_position;
out float v_spawnTime;
out float v_life;
out float v_size;
out vec3 v_velocity;
out float v_textureUnit;
out vec4 v_color;

float random(inout vec2 seed)
{
    seed.y += 0.1;

    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main()
{
    float currentLife = a_spawnTime + a_life - u_time;
    vec2 seed = vec2(float (gl_VertexID), u_time);

    if (currentLife <= 0.0)
    {
        v_position = vec3(random(seed) / 100.0, random(seed) / 10.0, random(seed) / 100.0);
        v_velocity = vec3(0.0, (random(seed) + 1.2) / 10.0, 0.0);
        v_spawnTime = u_time;
        v_life = (random(seed) + 0.25) * 1.4;
        v_size = random(seed) * 1.6;
        v_color = vec4((random(seed) + 9.0) / 10.0, (random(seed) + 6.0) / 10.0, 0.0, 0.5);
        v_textureUnit = round(random(seed) * 2.0);
    }
    else
    {
        v_position = a_position;
        v_velocity = a_velocity;
        v_spawnTime = a_spawnTime;
        v_life = a_life;
        v_size = a_size;
        v_color = a_color;
        v_textureUnit = a_textureUnit;
    }

    gl_Position = vec4(v_position, 1.0);
}