export class RenderLoop
{
    public fps: number;
    public ms: number;

    private oldTimestamp: number;
    private active: boolean;
    private onRender: (time: number) => void;
    private msArray: number[] = [];

    public constructor()
    {
        this.fps = 0;
        this.ms = 0;
        this.oldTimestamp = 0;
        this.active = false;
        this.onRender = () => null;
    }

    public start(onRender: (time: number) => void): void
    {
        this.onRender = onRender;
        this.active = true;

        window.requestAnimationFrame(this.run.bind(this));
    }

    public stop(): void
    {
        this.active = false;
    }

    private run(timestamp: number): void
    {
        const loopStart = performance.now();
        const secondsPassed = (timestamp - this.oldTimestamp) / 1000;

        this.oldTimestamp = timestamp;
        this.fps = 1 / secondsPassed;
        
        this.onRender(secondsPassed);

        const ms = performance.now() - loopStart;

        if (this.msArray.length >= 60) {
            this.msArray.shift();
        }

        this.msArray.push(ms);

        let sum = 0;
        for (let key in this.msArray) {
            sum += this.msArray[key];
        }

        this.ms = sum / this.msArray.length;
    
        if (this.active)
        {
            window.requestAnimationFrame(this.run.bind(this));
        }
    }
}