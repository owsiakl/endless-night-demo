export class Images
{
    /** @type {Map<string, HTMLImageElement>} */ #images = new Map();

    /**
     * @param {string} name
     * @returns HTMLImageElement
     */
    get(name)
    {
        return this.#images.get(name);
    }

    /**
     * @param {string} name
     * @param {HTMLImageElement} image
     */
    addImage(name, image)
    {
        this.#images.set(name, image);
    }
}