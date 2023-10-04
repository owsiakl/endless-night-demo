import {MovementControl} from "../Movement/MovementControl";
import {Assets} from "../Core/Assets";
import {ShaderMaterial} from "../Core/Material/ShaderMaterial";
import {Point} from "../Core/Object/Point";
import {Geometry} from "../Core/Geometry";
import {Camera} from "../Camera/Camera";

const COUNT = 1;

export class Fire extends Point
{
    public static create(assets: Assets, camera: Camera) : Fire
    {
        const material = new ShaderMaterial(assets.shader('fire_vertex'), assets.shader('fire_fragment'));
        material.uniforms.set('u_resolution', [camera.width, camera.height])

        const geometry = new Geometry();
        geometry.count = COUNT;
        geometry.setEmptyAttribute('a_position', COUNT * 3, COUNT);

        return new Fire(geometry, material.useBlending());
    }

    public update(time: float, movement: MovementControl) : void
    {
        const velocity = movement.velocity;
        const direction = (movement.previousAngle / Math.PI) % 1;
        let windFactor = 0;

        if (direction < 0)
        {
            windFactor = velocity * 0.25;
        }
        else if (direction > 0)
        {
            windFactor = -velocity * 0.25;
        }

        const material = this.material as ShaderMaterial;
        material.uniforms.set('u_time', time);
        material.uniforms.set('u_windFactor', windFactor);
    }
}