/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-buffer
 */
export class Buffer
{
    private arrayBufferCache: ArrayBuffer | undefined;

    constructor(
        public uri: string,
        public byteLength: number,
    ) {
    }

    public static fromJson(buffer: GLTF_buffer): Buffer
    {
        const self = new this(
            buffer.uri,
            buffer.byteLength,
        );

        if (undefined === self.uri) {
            // @ts-ignore
            self.arrayBufferCache = buffer.binary;
        }

        return self;
    }

    async arrayBufferAsync()
    {
        if (undefined === this.uri) {
            return;
        }

        if (this.uri.startsWith('data:')) {
            return;
        }

        const response = await fetch('/gltf/' + this.uri);
        const arrayBuffer = await response.arrayBuffer();

        this.arrayBufferCache = arrayBuffer;
    }

    public arrayBuffer(): ArrayBuffer
    {
        if (undefined !== this.arrayBufferCache) {
            return this.arrayBufferCache;
        }

        if (!this.uri.startsWith('data:')) {
            throw new Error(`GLTF buffer URIs other than data are not implemented.`);
        }

        const commaIndex = this.uri.indexOf(',');
        const [mimeType, encoding] = this.uri.substring(5, commaIndex).split(';');

        if (!['application/octet-stream', 'application/gltf-buffer'].includes(mimeType)) {
            throw new Error(`GLTF buffer data URIs "${mimeType}" mime type is not supported.`);
        }

        if (!['base64'].includes(encoding)) {
            throw new Error(`GLTF buffer data URIs "${encoding}" encoding is not supported.`);
        }

        const dataString = this.uri.substring(commaIndex + 1);
        const decodedString = atob(dataString);
        const arrayBuffer = new ArrayBuffer(decodedString.length);
        const bufferView = new Uint8Array(arrayBuffer);

        for (let i = 0; i < decodedString.length; i++) {
            bufferView[i] = decodedString.charCodeAt(i);
        }

        return arrayBuffer;
    }
}