import {Loader} from "../GLTF/Loader";

export class Assets
{
    private readonly _queue: Array<Function>;
    private readonly _shaders: Map<string, string>;
    private readonly _images: Map<string, HTMLImageElement>;
    private readonly _models: Map<string, Loader>;

    private _afterLoad: Function;
    private _assetsCount: number = 0;
    private _assetsLoaded: number = 0;

    public constructor()
    {
        this._afterLoad = () => {};
        this._queue = [];
        this._shaders = new Map();
        this._images = new Map();
        this._models = new Map();
    }

    public load(afterLoad: Function)
    {
        this._afterLoad = afterLoad

        this._queue.forEach(callback => callback());
    }

    public importShader(name: string, path: string) : void
    {
        this._assetsCount++;

        this._queue.push(() => fetch(path)
            .then(response => response.text())
            .then(shader => {
                this._shaders.set(name, shader);
                this._assetsLoaded++;

                this.checkAssets();
            })
            .catch(error => {
                throw new Error(error);
            })
        )
    }

    public importImage(name: string, path: string) : void
    {
        this._assetsCount++;

        this._queue.push(() => {
            const image = new Image();

            image.onload = () => {
                this._images.set(name, image);
                this._assetsLoaded++;

                this.checkAssets();
            };

            image.src = path;
        });
    }

    public importBinaryModel(name: string, path: string) : void
    {
        this._assetsCount++;

        this._queue.push(() => fetch(path)
            .then(response => response.arrayBuffer())
            .then(buffer => Loader.parseBinary(buffer))
            .then(model => {
                this._models.set(name, model);
                this._assetsLoaded++;

                this.checkAssets();
            })
            .catch(error => {
                throw new Error(error);
            })
        );
    }

    public getShader(name: string) : string
    {
        if (!this._shaders.has(name))
        {
            throw new Error(`Shader "${name}" not found in assets.`);
        }

        return this._shaders.get(name)!;
    }

    public getImage(name: string) : HTMLImageElement
    {
        if (!this._images.has(name))
        {
            throw new Error(`Image "${name}" not found in assets.`);
        }

        return this._images.get(name)!;
    }

    public getModel(name: string) : Loader
    {
        if (!this._models.has(name))
        {
            throw new Error(`Model "${name}" not found in assets.`);
        }

        return this._models.get(name)!;
    }

    private checkAssets() : void
    {
        if (this._assetsLoaded === this._assetsCount)
        {
            this._afterLoad();
        }
    }
}