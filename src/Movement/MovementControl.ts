import {AnimationControl} from "../Animation/AnimationControl";
import {StateMachine} from "../State/StateMachine";
import {IdleState} from "./IdleState";
import {WalkState} from "./WalkState";
import {RunState} from "./RunState";
import {Keyboard} from "../Input/Keyboard";

export class MovementControl extends StateMachine
{
    public readonly animations: AnimationControl;
    public readonly input: Keyboard;

    private constructor(animations: AnimationControl, input: Keyboard)
    {
        super();

        this.animations = animations;
        this.input = input;
    }

    public static bind(animations: AnimationControl, input: Keyboard) : MovementControl
    {
        const self = new MovementControl(animations, input);

        self.addState('idle', new IdleState(self));
        self.addState('walk', new WalkState(self));
        self.addState('run', new RunState(self));

        self.setState('idle');

        return self;
    }

    update(dt: float)
    {
        super.update(dt);

        this.animations.update(dt);
    }
}