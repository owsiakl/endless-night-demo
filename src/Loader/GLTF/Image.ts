import {BufferView} from "./BufferView";
import {Buffer} from "./Buffer";

/**
 * @link https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-image
 */
export class Image
{
    public static async fromJson(image: khr_gltf_image, bufferViews: Array<BufferView>, buffers: Array<Buffer>) : Promise<HTMLImageElement>
    {
        let uri: Nullable<string> = null;

        // from buffer
        if (undefined !== image.bufferView)
        {
            const bufferView = bufferViews[image.bufferView];
            const buffer = buffers[bufferView.buffer];
            const imageData = new Uint8Array(buffer.arrayBuffer(), bufferView.byteOffset, bufferView.byteLength / Uint8Array.BYTES_PER_ELEMENT);
            const blob = new Blob([imageData], {type: image.mimeType});

            uri = URL.createObjectURL(blob);
        }

        // from uri: data
        if (undefined !== image.uri && image.uri.startsWith('data:'))
        {
            uri = image.uri;
        }

        // from uri: file
        if (undefined !== image.uri && !image.uri.startsWith('data:'))
        {
            uri = `/image/${image.uri}`;
        }

        if (null === uri)
        {
            throw new Error('Cannot decode gltf image uri.');
        }

        return await this.resolveImage(uri);
    }

    private static resolveImage(uri: string) : Promise<HTMLImageElement>
    {
        return new Promise((resolve, reject) => {
            const image = new globalThis.Image();

            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Cannot fetch image from file.'));

            image.src = uri;
        });
    }
}