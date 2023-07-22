import {vec3, mat4} from "gl-matrix";

export class Camera
{
    public projectionMatrix: mat4;

    private cameraMatrix: mat4 = mat4.create();
    private eye: vec3 = [0, 0, 0];
    private center: vec3 = [0, 0, 0];
    private up: vec3 = [0, 0, -1];

    private _canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement)
    {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const fov = 45 * (Math.PI / 180);

        this._canvas = canvas;
        this.projectionMatrix = mat4.perspective(mat4.create(), fov, width / height, 1, 1000);

        this.updateCamera();
    }

    get viewMatrix(): mat4
    {
        return this.cameraMatrix;
    }

    private updateCamera(): void
    {
        mat4.lookAt(this.cameraMatrix, this.eye, this.center, this.up);
    }
}