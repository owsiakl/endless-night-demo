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

    float shadowCalculation(vec4 fragPosLightSpace)
    {
        vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture(u_projectedTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;
        float bias = 0.005;

        bool inRange =
                projCoords.x >= 0.0 &&
                projCoords.x <= 1.0 &&
                projCoords.y >= 0.0 &&
                projCoords.y <= 1.0;

        float shadow = 0.0;
        vec2 texelSize = 0.8 / vec2(textureSize(u_projectedTexture, 0));

        for (int x = -1; x <= 1; ++x)
        {
            for (int y = -1; y <= 1; ++y)
            {
                float pcfDepth = texture(u_projectedTexture, projCoords.xy + vec2(x, y) * texelSize).r;
                shadow += (inRange && currentDepth - bias > pcfDepth) ? 0.5 : 1.0;
            }
        }

        shadow /= 9.0;

        return shadow;
    }
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

//        vec4 color = texture(u_texture, v_texcoord);
        vec3 lightColor = vec3(0.8, 0.8, 0.8);
        vec3 lightDirection = u_lightPosition;

        float ambientStrength = 0.2;
        vec3 ambient = ambientStrength * lightColor;

        vec3 normal = normalize(v_normal);
//        vec3 surfaceToLight = lightDirection - v_vertex;
        float nDotL = min(max(dot(normal, lightDirection), 0.0), .8);
        vec3 diffuse = nDotL * lightColor;

        outColor = vec4(outColor.rgb * (ambient + diffuse), outColor.a);

    #endif

    #ifdef USE_SHADOWING
        outColor = vec4(outColor.rgb * shadowCalculation(v_projectedTexCoord), outColor.a);
    #endif
}