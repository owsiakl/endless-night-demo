import {State} from "../State/State";
import {MovementControl} from "./MovementControl";

export class IdleState extends State
{
    private _parent: MovementControl;

    public constructor(parent: MovementControl)
    {
        super();

        this._parent = parent;
    }

    public get name() : string
    {
        return 'idle';
    }

    public enter(previous: Nullable<State>) : void
    {
        if (null === previous)
        {
            this._parent.animations.play('idle');

            return;
        }

        this._parent.animations.fadeTo('idle');
    }

    public exit() : void
    {
    }

    public update() : void
    {
        if (this._parent.moving)
        {
            this._parent.setState('walk');
        }
    }
}