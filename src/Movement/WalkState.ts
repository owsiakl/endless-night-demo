import {State} from "../State/State";
import {MovementControl} from "./MovementControl";

export class WalkState extends State
{
    private _parent: MovementControl;

    public constructor(parent: MovementControl)
    {
        super();

        this._parent = parent;
    }

    public get name() : string
    {
        return 'walk';
    }

    public enter(previous: Nullable<State>) : void
    {
        if (previous && previous.name === 'idle')
        {
            this._parent.animations.fadeTo('walk');

            return;
        }

        this._parent.animations.fadeTo('walk', true);
    }

    public exit() : void
    {
    }

    public update() : void
    {
        if (!this._parent.input.forward && !this._parent.input.shift)
        {
            this._parent.setState('idle');
        }

        if (this._parent.input.forward && this._parent.input.shift)
        {
            this._parent.setState('run');
        }
    }
}