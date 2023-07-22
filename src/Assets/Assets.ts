import {Images} from './Images';
import {Shader} from './Shader';
import {ShaderType} from './ShaderType';
import {Shaders} from "./Shaders";
import {Logger} from "../Logger/Logger";

export class Assets
{
    public shaders = new Shaders();
    public images = new Images();

    private logger: Logger;
    private assetsCount: number = 0;
    private assetsLoaded: number = 0;
    private afterLoad: Function = () => {};

    public constructor(logger: Logger)
    {
        this.logger = logger;
    }

    /**
     * @param {() => void} afterLoad
     */
    public preload(afterLoad = () => {}) : void
    {
        this.afterLoad = afterLoad;

        this.importShader('triangle_vertex', '/shaders/triangle/vertex.glsl', ShaderType.VERTEX);
        this.importShader('triangle_fragment', '/shaders/triangle/fragment.glsl', ShaderType.FRAGMENT);
    }

    private checkAssets()
    {
        if (this.assetsLoaded === this.assetsCount) {
            this.logger.debug(`Assets preload completed.`);

            this.afterLoad();
        }
    }

    private importShader(name: string, path: string, type: ShaderType) : void
    {
        this.logger.debug(`Fetch ${type} shader "${name}".`, {'path': path});

        this.assetsCount++;

        const request = new XMLHttpRequest();

        request.open('GET', path);

        request.onloadend = () => {
            this.shaders.addShader(name, new Shader(request.response, type));
            this.assetsLoaded++;

            this.logger.debug(`Fetch ${type} shader "${name}" completed.`);

            this.checkAssets();
        };

        request.send();
    }

    private importImage(name: string, path: string) : void
    {
        this.logger.debug(`Fetch image "${name}".`, {'path': path});

        this.assetsCount++;

        const image = new Image();

        image.onload = () => {
            this.images.addImage(name, image);
            this.assetsLoaded++;

            this.logger.debug(`Fetch image "${name}" completed.`);

            this.checkAssets();
        };

        image.src = path;
    }
}