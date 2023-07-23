import {Camera} from "./Camera";

export class MouseCamera
{
    private camera: Camera;
    private mouseClicked: boolean;
    private lastMouseX: number;

    private constructor(camera: Camera)
    {
        this.camera = camera;
        this.lastMouseX = 0;
        this.mouseClicked = false;
    }

    public static control(camera: Camera, canvas: HTMLCanvasElement): void
    {
        const controller = new MouseCamera(camera);

        canvas.addEventListener('mouseup', controller.mouseUp.bind(controller));
        canvas.addEventListener('mousemove', controller.mouseMove.bind(controller));
        canvas.addEventListener('mousedown', controller.mouseDown.bind(controller));
        canvas.addEventListener('wheel', controller.mouseWheel.bind(controller));
    }

    private mouseDown(event: MouseEvent): void
    {
        this.mouseClicked = true;
        this.lastMouseX = event.clientX;
    }

    private mouseUp(): void
    {
        this.mouseClicked = false;
    }

    private mouseMove(event: MouseEvent): void
    {
        event.preventDefault();

        if (!this.mouseClicked) {
            return;
        }

        this.camera.rotate(event.clientX - this.lastMouseX);

        this.lastMouseX = event.clientX;
    }

    private mouseWheel(event: WheelEvent): void
    {
        event.preventDefault();

        this.camera.zoom(event.deltaY);
    }
}