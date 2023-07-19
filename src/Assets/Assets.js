import {Images} from './Images';
import {Shader} from './Shader';
import {ShaderType} from './ShaderType';
import {Shaders} from "./Shaders";

export class Assets
{
    shaders = new Shaders();
    images = new Images();

    #assetsCount = 0;
    #assetsLoaded = 0;
    #afterLoad = () => {};

    /**
     * @param {() => void} afterLoad
     */
    preload(afterLoad = () => {})
    {
        this.#afterLoad = afterLoad;

        this.#importShader('triangle_vertex', '/shaders/triangle/vertex.glsl', ShaderType.VERTEX);
        this.#importShader('triangle_fragment', '/shaders/triangle/fragment.glsl', ShaderType.FRAGMENT);
    }

    #checkAssets()
    {
        if (this.#assetsLoaded === this.#assetsCount) {
            this.#afterLoad();
        }
    }

    /**
     * @param {string} name
     * @param {string} path
     * @param {string} type
     */
    #importShader(name, path, type)
    {
        this.#assetsCount++;

        const request = new XMLHttpRequest();

        request.open('GET', path);

        request.onloadend = () => {
            this.shaders.addShader(name, new Shader(request.response, type));
            this.#assetsLoaded++;

            this.#checkAssets();
        };

        request.send();
    }

    /**
     * @param {string} name
     * @param {string} path
     */
    #importImage(name, path)
    {
        this.#assetsCount++;

        const image = new Image();

        image.onload = () => {
            this.images.addImage(name, image);
            this.#assetsLoaded++;

            this.#checkAssets();
        };

        image.src = path;
    }
}