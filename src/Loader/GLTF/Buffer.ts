/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-buffer
 */
export class Buffer
{
    private readonly _uri: string;
    private readonly _byteLength: number;
    private _arrayBufferCache: Nullable<ArrayBuffer>;

    private constructor(uri: string, byteLength: number)
    {
        this._uri = uri;
        this._byteLength = byteLength;
        this._arrayBufferCache = null;
    }

    public static async fromJson(buffer: khr_gltf_buffer) : Promise<Buffer>
    {
        const self = new this(buffer.uri, buffer.byteLength);

        if (undefined !== buffer.binary)
        {
            self._arrayBufferCache = buffer.binary;
        }
        else
        {
            if (!self._uri.startsWith('data:'))
            {
                const response = await fetch('/model/' + self._uri);

                self._arrayBufferCache = await response.arrayBuffer();
            }
        }

        return self;
    }

    public arrayBuffer(): ArrayBuffer
    {
        if (null !== this._arrayBufferCache)
        {
            return this._arrayBufferCache;
        }

        if (!this._uri.startsWith('data:'))
        {
            throw new Error(`GLTF buffer URIs other than data are not implemented.`);
        }

        const commaIndex = this._uri.indexOf(',');
        const [mimeType, encoding] = this._uri.substring(5, commaIndex).split(';');

        if (!['application/octet-stream', 'application/gltf-buffer'].includes(mimeType))
        {
            throw new Error(`GLTF buffer data URIs "${mimeType}" mime type is not supported.`);
        }

        if (!['base64'].includes(encoding))
        {
            throw new Error(`GLTF buffer data URIs "${encoding}" encoding is not supported.`);
        }

        const dataString = this._uri.substring(commaIndex + 1);
        const decodedString = atob(dataString);
        const arrayBuffer = new ArrayBuffer(decodedString.length);
        const bufferView = new Uint8Array(arrayBuffer);

        for (let i = 0; i < decodedString.length; i++)
        {
            bufferView[i] = decodedString.charCodeAt(i);
        }

        return arrayBuffer;
    }
}