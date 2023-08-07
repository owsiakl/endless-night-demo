precision highp float;

out vec4 outColor;

#ifdef USE_TEXTURE
    in vec2 v_texcoord;
    uniform sampler2D u_texture;
#endif

#ifdef USE_COLOR_ATTRIBUTE
    in vec4 v_color;
#endif

void main()
{
    #ifdef USE_TEXTURE
        outColor = texture(u_texture, v_texcoord);
    #endif

    #ifdef USE_COLOR_ATTRIBUTE
        outColor = v_color;
    #endif
}