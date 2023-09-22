import {Images} from './Images';
import {Shader} from './Shader';
import {ShaderType} from './ShaderType';
import {Shaders} from "./Shaders";
import {Logger} from "../Logger/Logger";
import {Models} from "./Models";
import {BinaryModels} from "./BinaryModels";

export class Assets
{
    public shaders = new Shaders();
    public images = new Images();
    public models = new Models();
    public binaryModels = new BinaryModels();

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

        this.importShader('default_vertex', '/shaders/default/vertex.glsl', ShaderType.VERTEX);
        this.importShader('default_fragment', '/shaders/default/fragment.glsl', ShaderType.FRAGMENT);
        this.importShader('depth_vertex', '/shaders/depth/vertex.glsl', ShaderType.VERTEX);
        this.importShader('depth_fragment', '/shaders/depth/fragment.glsl', ShaderType.FRAGMENT);
        this.importShader('particle_emit_vertex', '/shaders/particle/emit/vertex.glsl', ShaderType.VERTEX);
        this.importShader('particle_emit_fragment', '/shaders/particle/emit/fragment.glsl', ShaderType.FRAGMENT);
        this.importShader('particle_render_vertex', '/shaders/particle/render/vertex.glsl', ShaderType.VERTEX);
        this.importShader('particle_render_fragment', '/shaders/particle/render/fragment.glsl', ShaderType.FRAGMENT);

        this.importImage('fire_particle', 'image/fire.png');
        this.importImage('ground', 'image/ground.jpg');
        this.importImage('ground_normal', 'image/ground_normal.jpg');
        this.importImage('brickwall', 'image/brickwall.jpg');
        this.importImage('brickwall_normal', 'image/brickwall_normal.jpg');

        this.importModelBinary('glb_akai', '/gltf/akai.glb');
        this.importModelBinary('glb_torch', '/gltf/torch.glb');
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

    private importModelBinary(name: string, path: string) : void
    {
        this.logger.debug(`Fetch model "${name}".`, {'path': path});

        this.assetsCount++;

        fetch(path)
            .then(async response => {
                const data = await response.arrayBuffer();

                this.binaryModels.add(name, data);
                this.assetsLoaded++;

                this.logger.debug(`Fetch model "${name}" completed.`);

                this.checkAssets();
            })
            .catch(error => {
                throw new Error(error);
            });
    }
}