import {Logger} from "./Logger";

export class ConsoleLogger implements Logger
{
    public debug(message: string, context?: object): void
    {
        arguments.length > 1
            ? console.trace('%c%s', 'color: #3788ff; font-weight: normal', `[${this.date}] DEBUG ${message}`, context)
            : console.trace('%c%s', 'color: #3788ff; font-weight: normal', `[${this.date}] DEBUG ${message}`);
    }

    public warning(message: string, context?: object): void
    {
        arguments.length > 1
            ? console.warn(`[${this.date}] WARN ${message}`, context)
            : console.warn(`[${this.date}] WARN ${message}`);
    }

    public error(message: string, context?: object): void
    {
        arguments.length > 1
            ? console.error(`[${this.date}] ERROR ${message}`, context)
            : console.error(`[${this.date}] ERROR ${message}`);
    }

    private get date(): string
    {
        return (new Date()).toISOString().substring(0, 19).replace('T', ' ');
    }
}