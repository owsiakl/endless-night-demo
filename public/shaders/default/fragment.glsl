precision highp float;

out vec4 outColor;

#ifdef USE_TEXTURE
    in vec2 v_texcoord;
    uniform sampler2D u_texture;
#endif

#ifdef USE_COLOR_ATTRIBUTE
    in vec4 v_color;
#endif

#ifdef USE_STATIC_COLOR_ATTRIBUTE
    uniform vec3 u_color;
#endif

#ifdef USE_LIGHT
    uniform vec3 u_lightPosition;
    in vec3 v_vertex;
    in vec3 v_normal;
#endif

#ifdef USE_SHADOWING
    in vec4 v_projectedTexCoord;
    uniform sampler2D u_projectedTexture;
#endif

void main()
{
    #ifdef USE_TEXTURE
        outColor = texture(u_texture, v_texcoord);
    #endif

    #ifdef USE_COLOR_ATTRIBUTE
        outColor = v_color;
    #endif

    #ifdef USE_STATIC_COLOR_ATTRIBUTE
        outColor = vec4(u_color, 1.0);
    #endif

    #ifdef USE_LIGHT

        vec4 color = texture(u_texture, v_texcoord);
        vec3 lightColor = vec3(0.8, 0.8, 0.8);
        vec3 lightDirection = u_lightPosition;


        float ambientStrength = 0.2;
        vec3 ambient = ambientStrength * lightColor;

        vec3 normal = normalize(v_normal);
        vec3 surfaceToLight = lightDirection - v_vertex;
        float nDotL = min(max(dot(normal, surfaceToLight), 0.0), .8);
        vec3 diffuse = nDotL * lightColor;

        outColor = vec4(color.rgb * (ambient + diffuse), color.a);
    #endif

    #ifdef USE_SHADOWING
        vec3 projectedTexcoord = v_projectedTexCoord.xyz / v_projectedTexCoord.w;

        bool inRange =
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;

        vec4 projectedTexColor = texture(u_projectedTexture, projectedTexcoord.xy);
        float projectedAmount = inRange ? 1.0 : 0.0;

        outColor = mix(outColor, projectedTexColor, projectedAmount);
    #endif
}