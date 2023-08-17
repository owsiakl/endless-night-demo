import {Camera} from "../Camera/Camera";
import {Line} from "../Core/Object/Line";
import {Material} from "../Core/Material";
import {mat4, vec3, vec4} from "gl-matrix";
import {Geometry} from "../Core/Geometry";
import {Transform} from "../Core/Transform";

export class CameraDebug
{
    public camera: Camera;
    public cameraModel: Line;
    public frustumModel: Line;
    public frustumInitialPosition: TypedArray;

    public constructor(camera: Camera)
    {
        this.camera = camera;
        this.cameraModel = this.createCameraRepresentation(.1);
        this.frustumModel = this.createFrustumRepresentation();
        this.frustumInitialPosition = this.frustumModel.geometry.attributes[0].data;
    }

    public update() : void
    {
        const invertedView = mat4.invert(mat4.create(), this.camera.viewMatrix);
        this.cameraModel.model = Transform.fromMatrix(invertedView);

        const invertedProjectionView = mat4.invert(mat4.create(), this.camera.projectionViewMatrix);
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

    private createCameraRepresentation(scale: float = 1) : Line
    {
        const positions = [
            -1, -1,  1,
            1, -1,  1,
            -1,  1,  1,
            1,  1,  1,
            -1, -1,  3,
            1, -1,  3,
            -1,  1,  3,
            1,  1,  3,
            0,  0,  1,
        ];
        const indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
        ];

        const numSegments = 6;
        const coneBaseIndex = positions.length / 3;
        const coneTipIndex =  coneBaseIndex - 1;
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments;
            const angle = u * Math.PI * 2;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            positions.push(x, y, 0);
            indices.push(coneTipIndex, coneBaseIndex + i);
            indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments);
        }

        positions.forEach((v, ndx) => positions[ndx] *= scale);

        const geometry = new Geometry();

        geometry.setAttribute('a_position', new Float32Array(positions), 3);
        geometry.index = new Uint16Array(indices);
        geometry.count = indices.length;

        return new Line(
            geometry,
            (new Material()).setColor(vec3.fromValues(0, 0, 0))
        )
    }

    private createFrustumRepresentation() : Line
    {
        const positions = [
            -1, -1, -1, 1,
            1, -1, -1, 1,
            -1, 1, -1, 1,
            1, 1, -1, 1,
            -1, -1, 1, 1,
            1, -1, 1, 1,
            -1, 1, 1, 1,
            1, 1, 1, 1,
        ];
        const indices = [
            0, 1, 1, 3, 3, 2, 2, 0,
            4, 5, 5, 7, 7, 6, 6, 4,
            0, 4, 1, 5, 3, 7, 2, 6,
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