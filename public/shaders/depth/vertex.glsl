in vec4 a_position;
uniform mat4 u_lightSpace;
uniform mat4 u_model;

#ifdef USE_SKINNING
    const int MAX_JOINTS = 80;
    in vec4 a_joints;
    in vec4 a_weights;
    uniform mat4 u_jointMat[MAX_JOINTS];
#endif

void main()
{
    vec4 position = a_position;

    #ifdef USE_SKINNING
        mat4 skinMatrix =
            a_weights.x * u_jointMat[int(a_joints.x)] +
            a_weights.y * u_jointMat[int(a_joints.y)] +
            a_weights.z * u_jointMat[int(a_joints.z)] +
            a_weights.w * u_jointMat[int(a_joints.w)];

        position = skinMatrix * a_position;
    #endif

    gl_Position = u_lightSpace * u_model * position;
}