export class BinaryModels
{
    private models: Map<string, ArrayBuffer> = new Map();

    public get(name: string) : ArrayBuffer
    {
        if (!this.models.has(name)) {
            throw new Error(`Model "${name}" not found.`);
        }

        return this.models.get(name)!;
    }

    public add(name: string, model: ArrayBuffer) : void
    {
        if (this.models.has(name)) {
            throw new Error(`Model "${name}" was already added.`);
        }

        this.models.set(name, model);
    }
}