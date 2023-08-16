import {vec3, mat4, quat} from "gl-matrix";
import {Camera} from "./Camera";
import {Mouse} from "../Input/Mouse";

export class FlyCamera extends Camera
{
    private _zoomFactor = 0.005;
    private _rotateFactor = 0.01;

    public constructor(canvas: HTMLCanvasElement, position: vec3)
    {
        super(canvas, position);
    }

    public bindMouse(mouse: Mouse)
    {
        mouse.handleMouseWheel(value => {
            let direction = vec3.subtract(vec3.create(), this._position, this._target);
            let move = vec3.scale(vec3.create(), direction, value * this._zoomFactor);

            this._position[0] += move[0];
            this._position[1] += move[1];
            this._position[2] += move[2];

            this.calculateViewMatrix();
        });

        mouse.handleMouseMove(value => {
            const rotationSpeed = -value * this._rotateFactor;
            const currentPosition = vec3.clone(this._position);

            this._position[0] = currentPosition[0] * Math.cos(rotationSpeed) + currentPosition[2] * Math.sin(rotationSpeed);
            this._position[2] = currentPosition[2] * Math.cos(rotationSpeed) - currentPosition[0] * Math.sin(rotationSpeed);

            this.calculateViewMatrix();
        });
    }
}