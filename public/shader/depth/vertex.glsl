precision highp float;

layout (location = 0) in vec4 a_position;

uniform mat4 u_lightSpace;
uniform mat4 u_model;

#ifdef USE_SKINNING
    layout (location = 1) in vec4 a_joints;
    layout (location = 2) in vec4 a_weights;
    uniform sampler2D u_jointTexture;

    mat4 getBoneMatrix(int joint)
    {
        return mat4(
            texelFetch(u_jointTexture, ivec2(0, joint), 0),
            texelFetch(u_jointTexture, ivec2(1, joint), 0),
            texelFetch(u_jointTexture, ivec2(2, joint), 0),
            texelFetch(u_jointTexture, ivec2(3, joint), 0)
        );
    }
#endif

void main()
{
    vec4 position = a_position;

    #ifdef USE_SKINNING
        mat4 skinMatrix =
            a_weights.x * getBoneMatrix(int(a_joints.x)) +
            a_weights.y * getBoneMatrix(int(a_joints.y)) +
            a_weights.z * getBoneMatrix(int(a_joints.z)) +
            a_weights.w * getBoneMatrix(int(a_joints.w));

        position = skinMatrix * a_position;
    #endif

    gl_Position = u_lightSpace * u_model * position;
}