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
    uniform lowp sampler2DShadow u_depthTexture;
    in vec4 v_lightModelPosition;

    float shadowCalculation()
    {
        vec4 projCoords = v_lightModelPosition * 0.5 + 0.5;
        float pixelSize = 0.002;
        float shadow = 0.0;
        float x, y;

        bool inRange =
            projCoords.x >= 0.0 &&
            projCoords.x <= 1.0 &&
            projCoords.y >= 0.0 &&
            projCoords.y <= 1.0;

        for (x = -2.0; x <= 2.0; x += 2.0)
        {
            for (y = -2.0; y <= 2.0; y += 2.0)
            {
                vec4 offset = vec4 (x * pixelSize * projCoords.w, y * pixelSize * projCoords.w, 0.0, 0.0);

                shadow += inRange ? textureProj(u_depthTexture, projCoords + offset) : 1.0;
            }
        }

        shadow = shadow * 0.11;

        return shadow;
    }
#endif

#ifdef USE_LIGHT_POINT
    uniform lowp samplerCubeShadow u_depthCubeMapTexture;
    uniform float u_lightIntensity;
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

    float shadowCalculation(vec3 directionToLight)
    {
        float depth = directionToDepth(directionToLight);

        return texture(u_depthCubeMapTexture, vec4(directionToLight, depth));
    }
#endif

#ifdef USE_LIGHT
    uniform vec3 u_cameraPosition;
    uniform vec3 u_lightPosition;
    in vec3 v_vertex;
    in vec3 v_normal;
#endif

#ifdef USE_NORMAL_MAPPING
    uniform sampler2D u_textureNormal;
    in vec3 v_tangentLightPosition;
    in vec3 v_tangentCameraPosition;
    in vec3 v_tangentVertex;
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
        outColor = vec4(outColor.rgb * shadowCalculation(), outColor.a);
    #endif

    #ifdef USE_LIGHT_POINT
        vec3 lightColor = vec3(u_lightIntensity);

        // ambient
        float ambientStrength = 0.5;
        vec3 ambient = ambientStrength * vec3(0.4);

        #ifdef USE_TEXTURE
            ambient = texture(u_texture, v_texcoord).rgb * ambientStrength;
        #endif

        #ifdef USE_COLOR_ATTRIBUTE
            ambient = v_color.rgb * ambientStrength;
        #endif

        #ifdef USE_STATIC_COLOR_ATTRIBUTE
            ambient = u_color.rgb * ambientStrength;
        #endif

        vec3 normal = v_normal;
        vec3 lightPosition = u_lightPosition;
        vec3 cameraPosition = u_cameraPosition;
        vec3 vertex = v_vertex;

        #ifdef USE_NORMAL_MAPPING
            normal = texture(u_textureNormal, v_texcoord).rgb;
            normal = normalize(normal * 2.0 - 1.0);
            lightPosition = v_tangentLightPosition;
            cameraPosition = v_tangentCameraPosition;
            vertex = v_tangentVertex;
        #endif

        // diffuse
        vec3 lightDir = normalize(lightPosition - vertex);
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = diff * lightColor;

        #ifdef USE_TEXTURE
            diffuse = texture(u_texture, v_texcoord).rgb * lightColor;
        #endif

        #ifdef USE_COLOR_ATTRIBUTE
            diffuse = v_color.rgb * lightColor;
        #endif

        #ifdef USE_STATIC_COLOR_ATTRIBUTE
            diffuse = u_color.rgb * lightColor;
        #endif

        // specular
        float specularStrength = 0.0;
        vec3 viewDir = normalize(cameraPosition - vertex);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = specularStrength * spec * lightColor;

        // attenuation
        float constant = 1.0;
        float linear = 0.22;
        float quadratic = 0.20;

        float distance = length(u_lightPosition - v_vertex);
        float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));
        ambient  *= attenuation;
        diffuse  *= attenuation;
        specular *= attenuation;

        // shadow
        vec3 directionToLight = v_vertex - u_lightPosition;
        float shadow = shadowCalculation(directionToLight);

        // result
        vec3 light = (ambient + mix(vec3(0.4), vec3(1.0), shadow) * (diffuse + specular));

        outColor = vec4(light, 1.0);
    #endif
}