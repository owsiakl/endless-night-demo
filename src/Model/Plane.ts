import {Geometry} from "../Core/Geometry";
import {vec2, vec3} from "gl-matrix";

export class Plane
{
    static create(width: int = 1, height: int = 1, widthSegments: int = 1, heightSegments: int = 1) : Geometry
    {
        const positions = [];
        const normals = [];
        const uvs = [];
        const tangents = [];
        const bitangents = [];

        // vertices
        const halfWidth = width / 2.0;
        const halfHeight = height / 2.0;
        const normal = vec3.fromValues(0.0, 0.0, 1.0);

        const pos1 = vec3.fromValues(-halfWidth, halfHeight, 0);
        const pos2 = vec3.fromValues(-halfWidth, -halfHeight, 0);
        const pos3 = vec3.fromValues(halfWidth, -halfHeight, 0);
        const pos4 = vec3.fromValues(halfWidth, halfHeight, 0);

        const uv1 = vec2.fromValues(0.0, 1.0 * heightSegments);
        const uv2 = vec2.fromValues(0.0, 0.0);
        const uv3 = vec2.fromValues(1.0 * widthSegments, 0.0);
        const uv4 = vec2.fromValues(1.0 * widthSegments, 1.0 * heightSegments);

        // first triangle
        let edge1 = vec3.subtract(vec3.create(), pos2, pos1);
        let edge2 = vec3.subtract(vec3.create(), pos3, pos1);
        let deltaUV1 = vec2.subtract(vec2.create(), uv2, uv1);
        let deltaUV2 = vec2.subtract(vec2.create(), uv3, uv1);

        let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);
        const tangent1 = vec3.create();
        const bitangent1 = vec3.create();

        tangent1[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
        tangent1[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
        tangent1[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);

        bitangent1[0] = f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0]);
        bitangent1[1] = f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1]);
        bitangent1[2] = f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2]);

        // second triangle
        edge1 = vec3.subtract(vec3.create(), pos3, pos1);
        edge2 = vec3.subtract(vec3.create(), pos4, pos1);
        deltaUV1 = vec2.subtract(vec2.create(), uv3, uv1);
        deltaUV2 = vec2.subtract(vec2.create(), uv4, uv1);

        f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);
        const tangent2 = vec3.create();
        const bitangent2 = vec3.create();

        tangent2[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
        tangent2[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
        tangent2[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);

        bitangent2[0] = f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0]);
        bitangent2[1] = f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1]);
        bitangent2[2] = f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2]);


        positions.push(...pos1);
        normals.push(...normal);
        uvs.push(...uv1);
        tangents.push(...tangent1);
        bitangents.push(...bitangent1);

        positions.push(...pos2);
        normals.push(...normal);
        uvs.push(...uv2);
        tangents.push(...tangent1);
        bitangents.push(...bitangent1);

        positions.push(...pos3);
        normals.push(...normal);
        uvs.push(...uv3);
        tangents.push(...tangent1);
        bitangents.push(...bitangent1);

        positions.push(...pos1);
        normals.push(...normal);
        uvs.push(...uv1);
        tangents.push(...tangent2);
        bitangents.push(...bitangent2);

        positions.push(...pos3);
        normals.push(...normal);
        uvs.push(...uv3);
        tangents.push(...tangent2);
        bitangents.push(...bitangent2);

        positions.push(...pos4);
        normals.push(...normal);
        uvs.push(...uv4);
        tangents.push(...tangent2);
        bitangents.push(...bitangent2);

        const geometry = new Geometry();

        geometry.setAttribute('a_position', new Float32Array(positions), 3);
        geometry.setAttribute('a_normal', new Float32Array(normals), 3);
        geometry.setAttribute('a_uv', new Float32Array(uvs), 2);
        geometry.setAttribute('a_tangents', new Float32Array(tangents), 3);
        geometry.setAttribute('a_bitangents', new Float32Array(bitangents), 3);
        geometry.count = positions.length / 3;

        return geometry;
    }
}