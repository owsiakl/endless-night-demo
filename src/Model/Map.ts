import {Object3D} from "../Core/Object3D";
import {Mesh} from "../Core/Object/Mesh";
import {Plane} from "./Plane";
import {Material} from "../Core/Material";
import {quat, vec3} from "gl-matrix";
import {Assets} from "../Assets/Assets";

const SIZE: int = 10;
const SEGMENTS: int = 1;

export class Map
{
    public _tiles: Array<Object3D>;
    public _playerConstraintsX: [float, float];
    public _playerConstraintsZ: [float, float];

    public constructor(assets: Assets)
    {
        this._tiles = [];

        for (let x = 0; x < 3; x++)
        {
            for (let z = 0; z < 3; z++)
            {
                const tile = new Mesh(
                    Plane.create(SIZE, SIZE, SEGMENTS, SEGMENTS),
                    (new Material())
                        .setImage(assets.images.get('ground'), true)
                        .setNormal(assets.images.get('ground_normal'), true)
                );

                tile.rotation = quat.rotateX(quat.create(), tile.rotation, -Math.PI / 2);
                tile.translation = vec3.fromValues(-SIZE + (SIZE * x), 0.0, -SIZE + (SIZE * z));

                this._tiles.push(tile);
            }
        }

        this._playerConstraintsX = [-SIZE / 2, SIZE / 2];
        this._playerConstraintsZ = [-SIZE / 2, SIZE / 2];
    }

    update(position: vec3) : void
    {
        if (!this.withinConstraints(position))
        {
            let nearestPoint: Nullable<vec3> = null;

            for (let i = 0; i < this._tiles.length; i++)
            {
                if (null === nearestPoint)
                {
                    nearestPoint = this._tiles[i].translation;
                }

                const currentDistance = vec3.distance(position, this._tiles[i].translation);
                const nearestPointDistance = vec3.distance(position, nearestPoint);

                if (currentDistance < nearestPointDistance)
                {
                    nearestPoint = this._tiles[i].translation;
                }
            }

            if (null === nearestPoint)
            {
                throw new Error('Nearest point cannot be calculated.');
            }

            for (let i = 0, x = 0; x < 3; x++)
            {
                for (let z = 0; z < 3; z++, i++)
                {
                    const translation = vec3.fromValues(-SIZE + (SIZE * x), 0.0, -SIZE + (SIZE * z));

                    vec3.add(translation, translation, nearestPoint);

                    this._tiles[i].translation = translation;

                }
            }

            this._playerConstraintsX = [nearestPoint[0] - SIZE / 2, nearestPoint[0] + SIZE / 2];
            this._playerConstraintsZ = [nearestPoint[2] - SIZE / 2, nearestPoint[2] + SIZE / 2];
        }
    }

    private withinConstraints(position: vec3) : boolean
    {
        if (position[0] < this._playerConstraintsX[0] || position[0] > this._playerConstraintsX[1])
        {
            return false;
        }

        if (position[2] < this._playerConstraintsZ[0] || position[2] > this._playerConstraintsZ[1])
        {
            return false;
        }

        return true;
    }
}