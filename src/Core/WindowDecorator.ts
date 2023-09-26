export class WindowDecorator
{
    private _window: Window;

    constructor(window: Window)
    {
        this._window = window;
    }

    public find(selector: string) : Nullable<HTMLElement>
    {
        return this._window.document.querySelector(selector);
    }

    public addEventListener(type: string, callback: (event: any) => void) : void
    {
        this._window.document.addEventListener(type, callback);
    }

    get searchParams() : URLSearchParams
    {
        return new URLSearchParams(this._window.location.search);
    }

    get debug() : boolean
    {
        return this.searchParams.has('debug');
    }
}