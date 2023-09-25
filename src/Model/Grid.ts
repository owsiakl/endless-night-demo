import {Geometry} from "../Core/Geometry";

const CELL_SIZE: number = 1;
const COLUMNS: number = 5;

export class Grid
{
    static get create() : Geometry
    {
        const vertices = [];
        const colors = [];

        let currentLine = -COLUMNS * CELL_SIZE;

        for (let i = 0; i <= COLUMNS * 2; i++) {
            vertices.push(currentLine, 0, -COLUMNS * CELL_SIZE);
            vertices.push(currentLine, 0, COLUMNS * CELL_SIZE);

            vertices.push( -COLUMNS * CELL_SIZE, 0, currentLine);
            vertices.push(COLUMNS * CELL_SIZE, 0, currentLine);

            colors.push(0.4, 0.4, 0.4);
            colors.push(0.4, 0.4, 0.4);
            colors.push(0.4, 0.4, 0.4);
            colors.push(0.4, 0.4, 0.4);

            currentLine += CELL_SIZE;
        }

        // Y direction - blue
        vertices.push(-0.0001, 0, 0,  -0.0001, 5, 0);
        vertices.push(0.0001, 0, 0,   0.0001, 5, 0);
        vertices.push(0, 0, -0.0001,  0, 5, -0.0001);
        vertices.push(0, 0, 0.0001,   0, 5, 0.0001);

        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);
        colors.push(0.0, 0.0, 1.0);

        // X direction - red
        vertices.push(0, -0.0001, 0,  5, -0.0001, 0);
        vertices.push(0, 0.0001, 0,   5, 0.0001, 0);
        vertices.push(0, 0, -0.0001,  5, 0, -0.0001);
        vertices.push(0, 0, 0.0001,   5, 0, 0.0001);

        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);
        colors.push(1.0, 0.0, 0.0);

        // Z direction - green
        vertices.push(-0.0001, 0, 0,  -0.0001, 0, 5);
        vertices.push(0, 0.0001, 0,   0, 0.0001, 5);
        vertices.push(0, -0.0001, 0,  0, -0.0001, 5);
        vertices.push(0.0001, 0, 0,   0.0001, 0, 5);

        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);
        colors.push(0.0, 1.0, 0.0);

        const geometry = new Geometry();

        geometry.setAttribute('a_position', new Float32Array(vertices), 3);
        geometry.setAttribute('a_color', new Float32Array(colors), 3);
        geometry.count = vertices.length / 3;

        return geometry;
    }
}