import {types} from "sass";
import Null = types.Null;

export class Mouse
{
    public _clicked;
    public _scrolling;

    public _offsetX;
    public _mouseOffsetX;
    public _lastMouseOffsetX;

    public _wheelOffset;
    public _mouseWheelOffset;
    public _lastMouseWheelOffset;

    private constructor()
    {
        this._clicked = false;
        this._scrolling = false;

        this._offsetX = 0;
        this._mouseOffsetX = 0;
        this._lastMouseOffsetX = 0;

        this._wheelOffset = 0;
        this._mouseWheelOffset = 0;
        this._lastMouseWheelOffset = 0;
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

    public update()
    {
        if (this._clicked)
        {
            this._offsetX = this._mouseOffsetX - this._lastMouseOffsetX!;
            this._lastMouseOffsetX = this._mouseOffsetX;
        }

        this._scrolling = this._lastMouseWheelOffset != this._mouseWheelOffset;

        if (this._scrolling)
        {
            this._wheelOffset = this._mouseWheelOffset - this._lastMouseWheelOffset!;
            this._lastMouseWheelOffset = this._mouseWheelOffset;
        }
    }

    private mouseDown(event: MouseEvent) : void
    {
        this._clicked = true;
        this._lastMouseOffsetX = event.clientX;
    }

    private mouseUp() : void
    {
        this._clicked = false;
    }

    private mouseMove(event: MouseEvent) : void
    {
        this._mouseOffsetX = event.clientX;
    }

    private mouseWheel(event: WheelEvent) : void
    {
        this._mouseWheelOffset += event.deltaY;
    }
}