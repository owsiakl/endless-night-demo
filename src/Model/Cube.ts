import {Geometry} from "../Core/Geometry";

export class Cube
{
    static get create() : Geometry
    {
        const positions = [
            50, 50, 50,
            -50, 50, 50,
            -50, -50, 50,
            50, -50, 50,

            50, 50, -50,
            -50, 50, -50,
            -50, -50, -50,
            50, -50, -50,
        ];

        const colors = [
            10, 10, 10,
            10, 10, 200,
            10, 200, 10,
            10, 200, 200,
            200, 10, 10,
            200, 10, 200,
            200, 200, 10,
            200, 200, 200,
        ];

        const indices = [
            0, 1, 2,
            2, 3, 0,

            6, 5, 4,
            4, 7, 6,

            4, 5, 1,
            1, 0, 4,

            3, 2, 6,
            6, 7, 3,

            4, 0, 3,
            3, 7, 4,

            1, 5, 6,
            6, 2, 1,
        ];

        const geometry = new Geometry();

        geometry.setAttribute('a_position', new Float32Array(positions), 3);
        geometry.setAttribute('a_color', new Uint8Array(colors), 3, true);
        geometry.index = new Uint16Array(indices);
        geometry.count = indices.length;

        return geometry;
    }
}