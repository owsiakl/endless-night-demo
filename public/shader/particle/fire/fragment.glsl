#version 300 es
#define PI 3.1415926535

precision mediump float;

// slightly modified shader from https://www.shadertoy.com/view/Xd3GD4.

uniform float u_time;
uniform float u_windFactor;

out vec4 outColor;

vec2 hash(vec2 p)
{
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p)
{
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;

    vec2 i = floor(p + (p.x + p.y) * K1);

    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;

    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);

    vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

    return dot( n, vec3(70.0) );
}

float fbm(vec2 uv)
{
    float f;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    f  = 0.5000 * noise(uv); uv = m * uv;
    f += 0.2500 * noise(uv); uv = m * uv;
    f += 0.1250 * noise(uv); uv = m * uv;
    f += 0.0625 * noise(uv); uv = m * uv;
    f = 0.5 + 0.5 * f;
    return f;
}

vec2 roatate(vec2 coords, float angle)
{
    float radians = angle * PI / 180.0;
    vec2 center = vec2(0.5, 0.5);
    vec2 centeredPoint = coords - center;

    mat2 rotation = mat2(cos(radians), sin(radians), -sin(radians), cos(radians));

    return rotation * centeredPoint + center;
}

void main()
{
    vec2 uv = roatate(gl_PointCoord, 180.0);
    vec2 q = uv;

    if (u_windFactor != 0.0)
    {
        q.x += mix(0.0, u_windFactor, q.y);
    }

    float strength = 5.0;
    float T3 = 0.6 * strength * u_time;

    q.x = mod(q.x, 1.0) - 0.5;
    q.y -= 0.25;

    float n = fbm(strength * q - vec2(0, T3));
    float c = 1.0 - 16.0 * pow( max(0.0, length(q * vec2(1.8 + q.y * 1.5, 0.75)) - n * max(0.0, q.y + 0.25)), 1.2);

    float c1 = n * c * (1.4 - pow(1.4 * uv.y, 4.0));
    c1 = clamp(c1, 0.0, 1.0);

    vec3 color = vec3(1.5 * c1, 1.5 * pow(c1, 3.0), pow(c1, 6.0));
    color = mix(
        color,
        pow(vec3(1.0 - clamp(c1, -1.0, 0.0)) * pow(fbm(strength * q * 1.25 - vec2(0, T3)), 2.0), vec3(2.0)),
        0.75 - (color.x + color.y + color.z) / 3.0
    );

    float a = c * (1.0 - pow(uv.y , 1.0));
    outColor = vec4(mix(vec3(0.0), color, a), 0.6);
}