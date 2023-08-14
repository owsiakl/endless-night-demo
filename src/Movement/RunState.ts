import {State} from "../State/State";
import {MovementControl} from "./MovementControl";

export class RunState extends State
{
    private _parent: MovementControl;

    public constructor(parent: MovementControl)
    {
        super();

        this._parent = parent;
    }

    public get name() : string
    {
        return 'run';
    }

    public enter(previous: Nullable<State>) : void
    {
        this._parent.animations.fadeTo('run', true);
    }

    public exit() : void
    {
    }

    public update() : void
    {
        if (!this._parent.input.forward)
        {
            this._parent.setState('idle');

            return;
        }

        if (!this._parent.input.shift)
        {
            this._parent.setState('walk');
        }
    }
}