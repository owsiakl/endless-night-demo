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

                shadow += inRange ? textureProj(u_depthTexture, projCoords + offset, 1.0) : 1.0;
            }
        }

        shadow = shadow * 0.11;

        return shadow;
    }
#endif

#ifdef USE_LIGHT_POINT
    uniform samplerCube u_depthCubeMapTexture;
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
        vec3 lightColor = vec3(.5);

        // ambient
        float ambientStrength = 0.1;
        vec3 ambient = ambientStrength * lightColor;

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
            diffuse = texture(u_texture, v_texcoord).rgb;
        #endif

        #ifdef USE_COLOR_ATTRIBUTE
            diffuse = v_color.rgb;
        #endif

        #ifdef USE_STATIC_COLOR_ATTRIBUTE
            diffuse = u_color.rgb;
        #endif

        // specular
        float specularStrength = 0.5;
        vec3 viewDir = normalize(cameraPosition - vertex);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = specularStrength * spec * lightColor;

        // attenuation
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

        // 32
//        float constant = 1.0;
//        float linear = 0.14;
//        float quadratic = 0.07;

        // 50
//        float constant = 1.0;
//        float linear = 0.09;
//        float quadratic = 0.032;

        float distance = length(u_lightPosition - v_vertex);
        float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));
        ambient  *= attenuation;
        diffuse  *= attenuation;
        specular *= attenuation;

        // shadow
        vec3 directionToLight = v_vertex - u_lightPosition;
        float cubeMapDepth = unpack(texture(u_depthCubeMapTexture, directionToLight));
        float shadow = (cubeMapDepth + 0.0001 > directionToDepth(directionToLight)) ? 0.8 : 0.2;

        // result
        vec3 light = (ambient + shadow * (diffuse + specular));

        outColor = vec4(light, 1.0);
    #endif
}