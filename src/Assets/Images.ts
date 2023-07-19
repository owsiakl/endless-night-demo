export class Images
{
    private images: Map<string, HTMLImageElement> = new Map();

    public get(name: string) : HTMLImageElement
    {
        if (!this.images.has(name)) {
            throw new Error(`Image "${name}" not found.`);
        }

        return this.images.get(name)!;
    }

    public addImage(name: string, image: HTMLImageElement) : void
    {
        if (this.images.has(name)) {
            throw new Error(`Image "${name}" was already added.`);
        }

        this.images.set(name, image);
    }
}