export class Keyboard
{
    public forward: boolean;
    public shift: boolean;

    private constructor()
    {
        this.forward = false;
        this.shift = false;
    }

    static create() : Keyboard
    {
        const self = new this();

        document.addEventListener('keydown', self.bindKeyDown.bind(self));
        document.addEventListener('keyup', self.bindKeyUp.bind(self));

        return self;
    }

    private bindKeyDown(event: KeyboardEvent) : void
    {
        switch (event.code)
        {
            case 'KeyW':
                this.forward = true;
                break;

            case 'ShiftLeft':
                this.shift = true;
                break;
        }
    }

    private bindKeyUp(event: KeyboardEvent) : void
    {
        switch (event.code)
        {
            case 'KeyW':
                this.forward = false;
                break;

            case 'ShiftLeft':
                this.shift = false;
                break;
        }
    }
}