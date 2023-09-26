precision highp float;

out vec4 outColor;

vec4 pack(float depth)
{
    const vec4 bit_shift = vec4(255.0 * 255.0 * 255.0, 255.0 * 255.0, 255.0, 1.0);
    const vec4 bit_mask = vec4(0.0, 1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0);

    vec4 res = fract(depth * bit_shift);
    res -= res.xxyz * bit_mask;

    return res;
}

void main()
{
    outColor = pack(gl_FragCoord.z);
}
