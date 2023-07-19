import {Logger} from "./Logger";

export class NullLogger implements Logger
{
    public debug(message: string, context?: object): void
    {
    }

    public error(message: string, context?: object): void
    {
    }

    public warning(message: string, context?: object): void
    {
    }
}