export class Mouse
{
    private _mouseClicked;
    private _lastMouseX;
    private _currentMouseX;

    private _mouseMoveHandlers: Array<(value: float) => void>;
    private _mouseWheelHandlers: Array<(value: float) => void>;

    private constructor()
    {
        this._mouseClicked = false;
        this._lastMouseX = 0;
        this._currentMouseX = 0;

        this._mouseMoveHandlers = [];
        this._mouseWheelHandlers = [];
    }

    static create() : Mouse
    {
        const self = new this();

        document.addEventListener('mouseup', self.mouseUp.bind(self));
        document.addEventListener('mousemove', self.mouseMove.bind(self));
        document.addEventListener('mousedown', self.mouseDown.bind(self));
        document.addEventListener('wheel', self.mouseWheel.bind(self));

        return self;
    }

    public handleMouseMove(callback: (value: float) => void) : void
    {
        this._mouseMoveHandlers.push(callback);
    }

    public handleMouseWheel(callback: (value: float) => void) : void
    {
        this._mouseWheelHandlers.push(callback);
    }

    private mouseDown(event: MouseEvent) : void
    {
        this._mouseClicked = true;
        this._lastMouseX = event.clientX;
    }

    private mouseUp() : void
    {
        this._mouseClicked = false;
    }

    private mouseMove(event: MouseEvent) : void
    {
        event.preventDefault();

        if (!this._mouseClicked) {
            return;
        }

        for (const handler of this._mouseMoveHandlers)
        {
            handler(event.clientX - this._lastMouseX);
        }

        this._lastMouseX = event.clientX;
    }

    private mouseWheel(event: WheelEvent) : void
    {
        // event.preventDefault();

        for (const handler of this._mouseWheelHandlers)
        {
            handler(event.deltaY);
        }
    }
}