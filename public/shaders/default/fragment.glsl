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

#ifdef USE_LIGHT_DIRECTIONAL
    uniform sampler2D u_depthTexture;
    in vec4 v_lightModelPosition;

    float shadowCalculation(vec4 fragPosLightSpace)
    {
        vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
        projCoords = projCoords * 0.5 + 0.5;
        float closestDepth = texture(u_depthTexture, projCoords.xy).r;
        float currentDepth = projCoords.z;
        float bias = 0.005;

        bool inRange =
                projCoords.x >= 0.0 &&
                projCoords.x <= 1.0 &&
                projCoords.y >= 0.0 &&
                projCoords.y <= 1.0;

        float shadow = 0.0;
        vec2 texelSize = 0.8 / vec2(textureSize(u_depthTexture, 0));

        for (int x = -1; x <= 1; ++x)
        {
            for (int y = -1; y <= 1; ++y)
            {
                float pcfDepth = texture(u_depthTexture, projCoords.xy + vec2(x, y) * texelSize).r;
                shadow += (inRange && currentDepth - bias > pcfDepth) ? 0.5 : 1.0;
            }
        }

        shadow /= 9.0;

        return shadow;
    }
#endif

#ifdef USE_LIGHT_POINT
    uniform samplerCube u_depthCubeMapTexture;
    uniform vec3 u_lightPosition;

    in vec3 v_vertex;

    const float far = 20.0;
    const float near = 0.1;

    float unpack(vec4 color)
    {
        const vec4 bit_shift = vec4(1.0 / (255.0 * 255.0 * 255.0), 1.0 / (255.0 * 255.0), 1.0 / 255.0, 1.0);
        return dot(color, bit_shift);
    }

    float directionToDepth(vec3 directionToLight)
    {
        vec3 absDirectionToLight = abs(directionToLight);
        float maxValue = max(absDirectionToLight.x, max(absDirectionToLight.y, absDirectionToLight.z));
        float normalizedDepth = (far + near) / (far - near) - (2.0 * far * near) / (far - near) / maxValue;

        return (normalizedDepth + 1.0) * 0.5;
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

    #ifdef USE_LIGHT_DIRECTIONAL
        outColor = vec4(outColor.rgb * shadowCalculation(v_lightModelPosition), outColor.a);
    #endif

    #ifdef USE_LIGHT_POINT
        // Distance	Constant	Linear	Quadratic
        // 7	    1.0	        0.7	    1.8
        // 13	    1.0	        0.35	0.44
        // 20	    1.0	        0.22	0.20
        // 32	    1.0	        0.14	0.07
        // 50	    1.0	        0.09	0.032
        // 65	    1.0	        0.07	0.017
        // 100	    1.0	        0.045	0.0075
        // 160	    1.0	        0.027	0.0028
        // 200	    1.0	        0.022	0.0019
        // 325	    1.0	        0.014	0.0007
        // 600	    1.0	        0.007	0.0002
        // 3250	    1.0	        0.0014	0.000007

        // 20
        float constant = 1.0;
        float linear = 0.22;
        float quadratic = 0.20;

        // 50
//        float constant = 1.0;
//        float linear = 0.09;
//        float quadratic = 0.032;

        float distance = length(u_lightPosition - v_vertex);
        float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));

        vec3 directionToLight = v_vertex - u_lightPosition;
        float cubeMapDepth = unpack(texture(u_depthCubeMapTexture, directionToLight));
        float shadow = (cubeMapDepth + 0.00015 > directionToDepth(directionToLight)) ? 1.0 : 0.5;

        outColor = vec4(outColor.xyz * attenuation * shadow, outColor.a);
    #endif
}