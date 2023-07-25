import {Images} from './Images';
import {Shader} from './Shader';
import {ShaderType} from './ShaderType';
import {Shaders} from "./Shaders";
import {Logger} from "../Logger/Logger";
import {Models} from "./Models";

export class Assets
{
    public shaders = new Shaders();
    public images = new Images();
    public models = new Models();

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
        this.importShader('cube_vertex', '/shaders/cube/vertex.glsl', ShaderType.VERTEX);
        this.importShader('cube_fragment', '/shaders/cube/fragment.glsl', ShaderType.FRAGMENT);
        this.importShader('grid_vertex', '/shaders/grid/vertex.glsl', ShaderType.VERTEX);
        this.importShader('grid_fragment', '/shaders/grid/fragment.glsl', ShaderType.FRAGMENT);
        this.importShader('gltf_vertex', '/shaders/gltf/vertex.glsl', ShaderType.VERTEX);
        this.importShader('gltf_fragment', '/shaders/gltf/fragment.glsl', ShaderType.FRAGMENT);

        this.importModel('gltf_triangle', '/gltf/triangle.gltf');
        this.importModel('gltf_cube_guy', '/gltf/cube-guy.gltf');

        this.importImage('testTexture.png', 'image/triangle/testTexture.png');
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

    private importModel(name: string, path: string) : void
    {
        this.logger.debug(`Fetch model "${name}".`, {'path': path});

        this.assetsCount++;

        const request = new XMLHttpRequest();

        request.open('GET', path);

        request.onloadend = () => {
            this.models.add(name, request.response);
            this.assetsLoaded++;

            this.logger.debug(`Fetch model "${name}" completed.`);

            this.checkAssets();
        };

        request.send();
    }
}