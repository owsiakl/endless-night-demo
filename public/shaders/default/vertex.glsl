precision highp float;

layout (location = 0) in vec4 a_position;
uniform mat4 u_projectionView;
uniform mat4 u_model;

#ifdef USE_SKINNING
    const int MAX_JOINTS = 80;
    in vec4 a_joints;
    in vec4 a_weights;
    uniform mat4 u_jointMat[MAX_JOINTS];
#endif

#ifdef USE_TEXTURE
    in vec2 a_uv;
    out vec2 v_texcoord;
#endif

#ifdef USE_COLOR_ATTRIBUTE
    in vec4 a_color;
    out vec4 v_color;
#endif

#ifdef USE_LIGHT_DIRECTIONAL
    uniform mat4 u_lightProjectionViewMatrix;
    out vec4 v_lightModelPosition;
#endif

#ifdef USE_LIGHT
    uniform mat4 u_normalMatrix;

    in vec3 a_normal;

    out vec3 v_vertex;
    out vec3 v_normal;
#endif

#ifdef USE_NORMAL_MAPPING
    uniform vec3 u_cameraPosition;
    uniform vec3 u_lightPosition;

    in vec3 a_tangents;
    in vec3 a_bitangents;

    out vec3 v_tangentLightPosition;
    out vec3 v_tangentCameraPosition;
    out vec3 v_tangentVertex;
#endif

void main()
{
    vec4 position = a_position;

    #ifdef USE_LIGHT
        vec3 normal = a_normal;
    #endif

    #ifdef USE_SKINNING
        mat4 skinMatrix =
                a_weights.x * u_jointMat[int(a_joints.x)] +
                a_weights.y * u_jointMat[int(a_joints.y)] +
                a_weights.z * u_jointMat[int(a_joints.z)] +
                a_weights.w * u_jointMat[int(a_joints.w)];

        position = skinMatrix * a_position;

        #ifdef USE_LIGHT
            normal = mat3(skinMatrix) * a_normal;
        #endif
    #endif

    vec4 worldPosition = u_model * position;

    #ifdef USE_COLOR_ATTRIBUTE
        v_color = a_color;
    #endif

    #ifdef USE_TEXTURE
        v_texcoord = a_uv;
    #endif

    #ifdef USE_LIGHT_DIRECTIONAL
        v_lightModelPosition = u_lightProjectionViewMatrix * worldPosition;
    #endif

    #ifdef USE_LIGHT
        v_normal = vec3(mat3(u_normalMatrix) * normal);
        v_vertex = vec3(worldPosition);
    #endif

    #ifdef USE_NORMAL_MAPPING
        vec3 T = normalize(mat3(u_normalMatrix) * a_tangents);
        vec3 B = normalize(mat3(u_normalMatrix) * a_bitangents);
        vec3 N = normalize(mat3(u_normalMatrix) * normal);

//        T = normalize(T - dot(T, N) * N);
//        vec3 B = cross(N, T);

        mat3 TBN = transpose(mat3(T, B, N));

        v_tangentLightPosition = TBN * u_lightPosition;
        v_tangentCameraPosition  = TBN * u_cameraPosition;
        v_tangentVertex  = TBN * vec3(worldPosition);
    #endif

    gl_Position = u_projectionView * worldPosition;
}