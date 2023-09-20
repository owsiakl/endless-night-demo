import {Point} from "./Point";
import {Geometry} from "../Geometry";
import {Material} from "../Material";

export class Particle extends Point
{
    public readonly _totalSize: int;
    public time: float = 0;

    constructor(particleTexture: HTMLImageElement, particlesCount: int = 1_000)
    {
        const geometry = new Geometry();
        geometry.count = particlesCount;
        geometry.setEmptyAttribute('a_position', 3);
        geometry.setEmptyAttribute('a_spawnTime', 1);
        geometry.setEmptyAttribute('a_life', 1);
        geometry.setEmptyAttribute('a_size', 1);
        geometry.setEmptyAttribute('a_velocity', 3);
        geometry.setEmptyAttribute('a_textureUnit', 1);
        geometry.setEmptyAttribute('a_color', 4);

        super(geometry, (new Material()).setImage(particleTexture));

        this._totalSize = geometry.attributesLength * particlesCount;
    }

    public update(dt: float)
    {
        this.time += dt;
    }

    public get allocateData() : Float32Array
    {
        return (new Float32Array(this._totalSize));
    }
}