precision highp float;

out float outColor;

void main()
{
    outColor = gl_FragCoord.z;
}