export class Models
{
    private models: Map<string, string> = new Map();

    public get(name: string) : string
    {
        if (!this.models.has(name)) {
            throw new Error(`Model "${name}" not found.`);
        }

        return this.models.get(name)!;
    }

    public add(name: string, model: string) : void
    {
        if (this.models.has(name)) {
            throw new Error(`Model "${name}" was already added.`);
        }

        this.models.set(name, model);
    }
}