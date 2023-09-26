import {WindowDecorator} from "../Core/WindowDecorator";

export class DebugContainer
{
    private readonly _updateInterval: int = 3;
    private readonly _samplesCount: int = 60;

    private _fpsSamples: Array<float> = [];
    private _cpuTimeSamples: Array<float> = [];
    private _gpuTimeSamples: Array<float> = [];

    private _active: boolean = false;
    private _lastUpdate: float = this._updateInterval;

    public constructor(
        private readonly _fpsElement: HTMLSpanElement,
        private readonly _cpuTimeElement: HTMLSpanElement,
        private readonly _gpuTimeElement: HTMLSpanElement,
        private readonly _jsHeapUsedElement: HTMLSpanElement,
        private readonly _jsHeapLimitElement: HTMLSpanElement,
        private readonly _jsHeapAvailableElement: HTMLSpanElement,
    ) {
    }

    public static create(windowDecorator: WindowDecorator) : DebugContainer
    {
        const container = windowDecorator.find('[data-debug-container]')!;
        const button = windowDecorator.find('[data-toggle-debug-container]')!;

        const self =  new this(
            container.querySelector('[data-fps-counter]')!,
            container.querySelector('[data-ms-cpu-counter]')!,
            container.querySelector('[data-ms-gpu-counter]')!,
            container.querySelector('[data-heap-used]')!,
            container.querySelector('[data-heap-limit]')!,
            container.querySelector('[data-heap-available]')!,
        );

        button.addEventListener('click', () => self._active = container.classList.toggle('active'));
        button.classList.add('initialized');

        return self;
    }

    public update(dt: float) : void
    {
        if (!this._active)
        {
            return;
        }

        this._lastUpdate += dt;

        if (this._lastUpdate < this._updateInterval)
        {
            return;
        }

        this._fpsElement.textContent = Math.round(this.averageFrom(this._fpsSamples)).toString();
        this._cpuTimeElement.textContent = this.averageFrom(this._cpuTimeSamples).toFixed(2).concat(' ms');
        this._gpuTimeElement.textContent = this.averageFrom(this._gpuTimeSamples).toFixed(2).concat(' ms');

        // @ts-ignore
        const memory = window.performance.memory;

        if (undefined !== memory)
        {
            this._jsHeapLimitElement.textContent = Math.round(memory.jsHeapSizeLimit / 1000000).toString().concat(' MB');
            this._jsHeapAvailableElement.textContent = Math.round(memory.totalJSHeapSize / 1000000).toString().concat(' MB');
            this._jsHeapUsedElement.textContent = Math.round(memory.usedJSHeapSize / 1000000).toString().concat(' MB');
        }

        this._lastUpdate = 0;
    }

    public set fps(value: float)
    {
        this._fpsSamples.push(value);

        if (this._fpsSamples.length >= this._samplesCount) {
            this._fpsSamples.shift();
        }
    }

    public set cpuTime(value: float)
    {
        this._cpuTimeSamples.push(value);

        if (this._cpuTimeSamples.length >= this._samplesCount) {
            this._cpuTimeSamples.shift();
        }
    }

    public set gpuTime(value: float)
    {
        this._gpuTimeSamples.push(value);

        if (this._gpuTimeSamples.length >= this._samplesCount) {
            this._gpuTimeSamples.shift();
        }
    }

    private averageFrom(list: Array<float>) : float
    {
        if (list.length === 0)
        {
            return 0;
        }

        let sum = 0;

        for (let i = 0; i < list.length; i++)
        {
            sum += list[i];
        }

        return sum / list.length;
    }
}