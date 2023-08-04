#version 300 es

const int MAX_JOINTS = 30;

in vec4 a_position;
in vec2 a_uv;
in vec4 a_joints;
in vec4 a_weights;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
uniform mat4 u_jointMat[MAX_JOINTS];

out vec2 v_texcoord;

void main()
{
    mat4 skinMatrix =
                a_weights.x * u_jointMat[int(a_joints.x)] +
                a_weights.y * u_jointMat[int(a_joints.y)] +
                a_weights.z * u_jointMat[int(a_joints.z)] +
                a_weights.w * u_jointMat[int(a_joints.w)];

    gl_Position = u_projection * u_view * u_model * skinMatrix * a_position;

    v_texcoord = a_uv;
}