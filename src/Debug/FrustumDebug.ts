import {Line} from "../Core/Object/Line";
import {Material} from "../Core/Material";
import {mat4, vec3, vec4} from "gl-matrix";
import {Geometry} from "../Core/Geometry";

export class FrustumDebug
{
    public frustumModel: Line;
    public frustumInitialPosition: TypedArray;

    public constructor()
    {
        this.frustumModel = this.createFrustumRepresentation();
        this.frustumInitialPosition = this.frustumModel.geometry.attributes[0].data;
    }

    public update(projectionViewMatrix: mat4) : void
    {
        const invertedProjectionView = mat4.invert(mat4.create(), projectionViewMatrix);
        const initialPosition = this.frustumInitialPosition;
        const newPosition = [];

        for (let i = 0; i < initialPosition.length; i += 4)
        {
            const position = vec4.fromValues(
                initialPosition[i],
                initialPosition[i + 1],
                initialPosition[i + 2],
                initialPosition[i + 3]
            );

            vec4.transformMat4(position, position, invertedProjectionView);

            position[0] /= position[3];
            position[1] /= position[3];
            position[2] /= position[3];
            position[3] = 1.0;

            newPosition[i] = position[0];
            newPosition[i + 1] = position[1];
            newPosition[i + 2] = position[2];
            newPosition[i + 3] = position[3];
        }

        this.frustumModel.geometry.attributes[0].data = new Float32Array(newPosition);
        this.frustumModel.geometry.updateBuffers = true;

    }
    private createFrustumRepresentation() : Line
    {
        const positions = [
            -1, -1, -1, 1,
            1, -1, -1, 1,
            -1,  1, -1, 1,
            1,  1, -1, 1,
            -1, -1,  1, 1,
            1, -1,  1, 1,
            -1,  1,  1, 1,
            1,  1,  1, 1,
        ];
        const indices = [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            4, 5,
            5, 7,
            7, 6,
            6, 4,

            0, 4,
            1, 5,
            3, 7,
            2, 6,
        ];

        const geometry = new Geometry();

        geometry.setAttribute('a_position', new Float32Array(positions), 4);
        geometry.index = new Uint16Array(indices);
        geometry.count = indices.length;

        return new Line(
            geometry,
            (new Material()).setColor(vec3.fromValues(0, 0, 0))
        )
    }
}