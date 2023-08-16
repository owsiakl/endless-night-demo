import {vec3, mat4, quat} from "gl-matrix";

const FOV = 45;
const NEAR = 0.1;
const FAR = 1000;

const ROTATE_FACTOR = 0.01;
const ZOOM_FACTOR = 0.005;

export class Camera
{
    public projectionMatrix: mat4;
    private cameraMatrix: mat4;
    public cameraPosition: vec3;
    private target: vec3;

    public constructor(canvas: HTMLCanvasElement)
    {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const fov = FOV * (Math.PI / 180);

        this.projectionMatrix = mat4.perspective(mat4.create(), fov, width / height, NEAR, FAR);
        this.cameraMatrix = mat4.create();
        this.cameraPosition = vec3.fromValues(-8, 6, 5);
        this.target = vec3.fromValues(0, 0, 0);
    }

    public zoom(value: number): void
    {
        let direction = vec3.subtract(vec3.create(), this.cameraPosition, this.target);
        let move = vec3.scale(vec3.create(), direction, value * ZOOM_FACTOR);

        vec3.add(this.cameraPosition, this.cameraPosition, move);
    }

    public rotate(delta: number): void
    {
        const rotationSpeed = -delta * ROTATE_FACTOR;
        const currentPosition = mat4.getTranslation(vec3.create(), this.cameraMatrix);

        this.cameraPosition[0] = currentPosition[0] * Math.cos(rotationSpeed) + currentPosition[2] * Math.sin(rotationSpeed);
        this.cameraPosition[2] = currentPosition[2] * Math.cos(rotationSpeed) - currentPosition[0] * Math.sin(rotationSpeed);
    }

    public update(): void
    {
        mat4.targetTo(this.cameraMatrix, this.cameraPosition, this.target, [0, 1, 0]);
    }

    public get viewMatrix(): mat4
    {
        return mat4.invert(mat4.create(), this.cameraMatrix);
    }

    public get invertRotY() : quat
    {
        const rotation = mat4.getRotation(quat.create(), this.viewMatrix);
        const theta = Math.atan2(rotation[1], rotation[3])
        const rotY = quat.fromValues(0, Math.sin(theta), 0, Math.cos(theta));

        return quat.invert(quat.create(), rotY);
    }
}