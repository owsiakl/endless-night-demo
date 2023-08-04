import {Material} from "../Material";

export class ShaderMaterial implements Material
{
    public image: HTMLImageElement|null = null;

    constructor(
        public readonly vertexShader: string,
        public readonly fragmentShader: string
    ) {
    }

    setImage(image: HTMLImageElement) : void
    {
        this.image = image
    }

}