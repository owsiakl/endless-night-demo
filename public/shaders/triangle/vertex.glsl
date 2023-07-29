#version 300 es

const int MAX_JOINTS = 30;

in vec4 a_position;
in vec2 a_texcoord;
in vec4 a_joint;
in vec4 a_weight;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;
uniform mat4 u_jointMat[MAX_JOINTS];

out vec2 v_texcoord;

void main()
{
    mat4 skinMatrix =
                a_weight.x * u_jointMat[int(a_joint.x)] +
                a_weight.y * u_jointMat[int(a_joint.y)] +
                a_weight.z * u_jointMat[int(a_joint.z)] +
                a_weight.w * u_jointMat[int(a_joint.w)];

    gl_Position = u_projection * u_view * u_model * skinMatrix * a_position;

    v_texcoord = a_texcoord;
}