export abstract class State
{
    public abstract get name() : string;
    public abstract enter(previous: Nullable<State>) : void;
    public abstract update(dt: float) : void;
    public abstract exit() : void;
}