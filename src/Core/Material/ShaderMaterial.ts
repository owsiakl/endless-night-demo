import {Material} from "../Material";

export class ShaderMaterial implements Material
{
    constructor(
        public readonly vertexShader: string,
        public readonly fragmentShader: string
    ) {
    }
}