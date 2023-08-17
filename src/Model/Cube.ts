import {Geometry} from "../Core/Geometry";
import {vec3} from "gl-matrix";

export class Cube
{
    static create2(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1)
    {
        const scope = this;

        // segments

        widthSegments = Math.floor( widthSegments );
        heightSegments = Math.floor( heightSegments );
        depthSegments = Math.floor( depthSegments );

        // buffers

        // @ts-ignore
        const indices = [];
        // @ts-ignore
        const vertices = [];
        // @ts-ignore
        const normals = [];
        // @ts-ignore
        const uvs = [];

        // helper variables

        let numberOfVertices = 0;
        let groupStart = 0;

        // build each side of the box geometry

        buildPlane( 2, 1, 0, - 1, - 1, depth, height, width, depthSegments, heightSegments, 0 ); // px
        buildPlane( 2, 1, 0, 1, - 1, depth, height, - width, depthSegments, heightSegments, 1 ); // nx
        buildPlane( 0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments, 2 ); // py
        buildPlane( 0, 2, 1, 1, - 1, width, depth, - height, widthSegments, depthSegments, 3 ); // ny
        buildPlane( 0, 1, 2, 1, - 1, width, height, depth, widthSegments, heightSegments, 4 ); // pz
        buildPlane( 0, 1, 2, - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5 ); // nz

        // build geometry

        const geometry = new Geometry();

        // @ts-ignore
        geometry.setAttribute('a_position', new Float32Array(vertices), 3);
        // @ts-ignore
        geometry.setAttribute('a_normal', new Float32Array(normals), 3);
        // @ts-ignore
        geometry.setAttribute('a_uv', new Float32Array(uvs), 2);
        // @ts-ignore
        geometry.index = new Uint16Array(indices);
        geometry.count = indices.length;

        return geometry;

        // @ts-ignore
        function buildPlane( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {

            const segmentWidth = width / gridX;
            const segmentHeight = height / gridY;

            const widthHalf = width / 2;
            const heightHalf = height / 2;
            const depthHalf = depth / 2;

            const gridX1 = gridX + 1;
            const gridY1 = gridY + 1;

            let vertexCounter = 0;
            let groupCount = 0;

            const vector = vec3.create();

            // generate vertices, normals and uvs

            for ( let iy = 0; iy < gridY1; iy ++ ) {

                const y = iy * segmentHeight - heightHalf;

                for ( let ix = 0; ix < gridX1; ix ++ ) {

                    const x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component

                    vector[ u ] = x * udir;
                    vector[ v ] = y * vdir;
                    vector[ w ] = depthHalf;

                    // now apply vector to vertex buffer

                    vertices.push( vector[0], vector[1], vector[2] );

                    // set values to correct vector component

                    vector[ u ] = 0;
                    vector[ v ] = 0;
                    vector[ w ] = depth > 0 ? 1 : - 1;

                    // now apply vector to normal buffer

                    normals.push( vector[0], vector[1], vector[2] );

                    // uvs

                    uvs.push( ix / gridX );
                    uvs.push( 1 - ( iy / gridY ) );

                    // counters

                    vertexCounter += 1;

                }

            }

            // indices

            // 1. you need three indices to draw a single face
            // 2. a single segment consists of two faces
            // 3. so we need to generate six (2*3) indices per segment

            for ( let iy = 0; iy < gridY; iy ++ ) {

                for ( let ix = 0; ix < gridX; ix ++ ) {

                    const a = numberOfVertices + ix + gridX1 * iy;
                    const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
                    const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
                    const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

                    // faces

                    indices.push( a, b, d );
                    indices.push( b, c, d );

                    // increase counter

                    groupCount += 6;

                }

            }



            // update total number of vertices

            numberOfVertices += vertexCounter;

        }
    }

    static create(width: int = 2) : Geometry
    {
        const positions = [
            width, width, width,
            -width, width, width,
            -width, -width, width,
            width, -width, width,

            width, width, -width,
            -width, width, -width,
            -width, -width, -width,
            width, -width, -width,
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