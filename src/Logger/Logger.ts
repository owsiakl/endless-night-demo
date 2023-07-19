export interface Logger
{
    debug(message: string, context?: object): void;

    warning(message: string, context?: object): void;

    error(message: string, context?: object): void;
}