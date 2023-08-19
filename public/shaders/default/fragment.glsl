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


float linearizeDepth(float depth)
{
    float near = 0.1;
    float far  = 30.0;
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

#ifdef USE_SHADOWING
    in vec4 v_projectedTexCoord;
    uniform sampler2D u_projectedTexture;

    float shadowCalculation(vec4 fragPosLightSpace)
    {
        vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture(u_projectedTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;
        float shadow = currentDepth > closestDepth  ? 0.0 : 1.0;

        return shadow;
    }
#endif


void main()
{
    #ifdef USE_TEXTURE
        outColor = texture(u_texture, v_texcoord);

        #ifdef DEPTH_MAP
            float depthValue = texture(u_texture, v_texcoord).r;

            // for ortho
            outColor = vec4(vec3(depthValue), 1.0);

            // for perspective
//            outColor = vec4(vec3(linearizeDepth(depthValue) / far), 1.0);
        #endif
    #endif

    #ifdef USE_COLOR_ATTRIBUTE
        outColor = v_color;
    #endif

    #ifdef USE_STATIC_COLOR_ATTRIBUTE
        outColor = vec4(u_color, 1.0);
    #endif

    #ifdef USE_LIGHT

//        vec4 color = texture(u_texture, v_texcoord);
        vec3 lightColor = vec3(0.8, 0.8, 0.8);
        vec3 lightDirection = u_lightPosition;


        float ambientStrength = 0.2;
        vec3 ambient = ambientStrength * lightColor;

        vec3 normal = normalize(v_normal);
//        vec3 surfaceToLight = lightDirection - v_vertex;
        float nDotL = min(max(dot(normal, lightDirection), 0.0), .8);
        vec3 diffuse = nDotL * lightColor;

//        #ifdef USE_SHADOWING
//            float shadow = shadowCalculation(FragPosLightSpace);
//            outColor = vec4((1.0 - shadow) * (ambient + diffuse) * outColor.rgb, 1.0);
//        #else
            outColor = vec4(outColor.rgb * (ambient + diffuse), outColor.a);
//        #endif

    #endif

    #ifdef USE_SHADOWING
        float u_bias = -0.001;
        vec3 projectedTexcoord = v_projectedTexCoord.xyz / v_projectedTexCoord.w;
        projectedTexcoord = projectedTexcoord * 0.5 + 0.5;

        float currentDepth = projectedTexcoord.z + u_bias;

        bool inRange =
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;

        float projectedDepth = texture(u_projectedTexture, projectedTexcoord.xy).r;
        float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 1.0;
        outColor = vec4(outColor.rgb * shadowLight, outColor.a);
    #endif
}