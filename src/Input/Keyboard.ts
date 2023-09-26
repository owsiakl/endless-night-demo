import {WindowDecorator} from "../Core/WindowDecorator";

export class Keyboard
{
    public forward: boolean;
    public right: boolean;
    public back: boolean;
    public left: boolean;
    public shift: boolean;

    public constructor(windowDecorator: WindowDecorator)
    {
        windowDecorator.addEventListener('keydown', this.bindKeyDown.bind(this));
        windowDecorator.addEventListener('keyup', this.bindKeyUp.bind(this));

        this.forward = false;
        this.right = false;
        this.back = false;
        this.left = false;
        this.shift = false;
    }

    private bindKeyDown(event: KeyboardEvent) : void
    {
        switch (event.code)
        {
            case 'KeyW':
            case 'ArrowUp':
                this.forward = true;
                break;

            case 'KeyD':
            case 'ArrowRight':
                this.right = true;
                break;

            case 'KeyS':
            case 'ArrowDown':
                this.back = true;
                break;

            case 'KeyA':
            case 'ArrowLeft':
                this.left = true;
                break;

            case 'ShiftLeft':
                this.shift = true;
                break;
        }
    }

    private bindKeyUp(event: KeyboardEvent) : void
    {
        switch (event.code)
        {
            case 'KeyW':
            case 'ArrowUp':
                this.forward = false;
                break;

            case 'KeyD':
            case 'ArrowRight':
                this.right = false;
                break;

            case 'KeyS':
            case 'ArrowDown':
                this.back = false;
                break;

            case 'KeyA':
            case 'ArrowLeft':
                this.left = false;
                break;

            case 'ShiftLeft':
                this.shift = false;
                break;
        }
    }
}