export class Wiggle
{
    private readonly _frequency: int;
    private readonly _amplitude: float;

    private _value: float;
    private _nextValue = 0;
    private _currentValue = 0;
    private _previousValue = 0;
    private _t = 0;

    /**
     * simple implementation of wiggle function from adobe after effect, with some modifications.
     *
     * @param value - base value.
     * @param frequency - how often the value should change (per second).
     * @param amplitude - how much the value can change above or below the value.
     */
    public constructor(value: float, frequency: int, amplitude: float)
    {
        this._value = value;
        this._previousValue = value;
        this._currentValue = value;
        this._frequency = frequency;
        this._amplitude = amplitude;
    }

    public update(dt: float) : void
    {
        this._t += dt * this._frequency;

        if (this._t >= 1.0)
        {
            this._previousValue = this._nextValue;
            this._nextValue = this._value + (Math.random() * (this._amplitude - (-this._amplitude)) - this._amplitude);
            this._t = 0;
        }

        this._currentValue = this._lerp(this._previousValue, this._nextValue, this._t);
    }

    public get value() : float
    {
        return this._currentValue;
    }

    public set value(value: float)
    {
        this._value = value;
    }

    private _lerp(from: float, to: float, t: float) : float
    {
        return from * (1.0 - t) + to * t;
    }
}