import {DebugContainer} from "../Debug/DebugContainer";

export class RenderLoop
{
    private readonly _debug: Nullable<DebugContainer>;
    private _oldTimestamp: number;
    private _active: boolean;
    private _onRender: (dt: float, time: float) => void;

    public constructor(debug: Nullable<DebugContainer>)
    {
        this._debug = debug;
        this._oldTimestamp = 0;
        this._active = false;
        this._onRender = () => null;
    }

    public start(onRender: (dt: float, time: float) => void) : void
    {
        this._onRender = onRender;
        this._active = true;

        requestAnimationFrame(this.run.bind(this));
    }

    public stop() : void
    {
        this._active = false;
    }

    private run(timestamp: number) : void
    {
        const loopStart = performance.now();
        const secondsPassed = (timestamp - this._oldTimestamp) / 1000;

        this._oldTimestamp = timestamp;

        this._onRender(secondsPassed, timestamp / 1000);

        if (null !== this._debug)
        {
            this._debug.fps = 1 / secondsPassed;
            this._debug.cpuTime = performance.now() - loopStart;
        }

        if (this._active)
        {
            requestAnimationFrame(this.run.bind(this));
        }
    }
}