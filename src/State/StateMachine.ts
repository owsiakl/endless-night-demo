import {State} from "./State";

export class StateMachine
{
    private readonly _states: {[name: string]: State};
    private _currentState: Nullable<State>;

    public constructor()
    {
        this._states = {};
        this._currentState = null;
    }

    public addState(name: string, state: State) : void
    {
        this._states[name] = state;
    }

    public setState(name: string) : void
    {
        const prevState = this._currentState;

        if (prevState)
        {
            if (prevState.name == name)
            {
                return;
            }

            prevState.exit();
        }

        const state = this._states[name];

        this._currentState = state;
        state.enter(prevState);
    }

    update(dt: float) : void
    {
        if (this._currentState)
        {
            this._currentState.update(dt);
        }
    }
}