import Geometry from './Geometry.mjs';
import { memoize } from '../internal/utils.mjs';

export default memoize((obj = {}) => {
    const def = { // default box dimensions
        x:-0.5, y:-0.5, z:-0.5, w:1.0, h:1.0, d:1.0
    };
    for (const p in def) {
        if (!(p in obj)) {
            obj[p] = def[p];
        }
    }
    // console.log(obj.x, obj.y, obj.z, obj.w, obj.h, obj.d);

    const verts = [
        [ (obj.x + obj.w), 	(obj.y + obj.h), 	  (obj.z + obj.d) ], 	// 0
        [ obj.x, 				    (obj.y + obj.h), 	  (obj.z + obj.d) ], 	// 1
        [ (obj.x + obj.w), 	obj.y, 			        (obj.z + obj.d) ], 	// 2
        [ obj.x, 			      obj.y, 				      (obj.z + obj.d) ], 	// 3
        [ obj.x, 			      (obj.y + obj.h), 	  obj.z ], 			// 4
        [ (obj.x + obj.w), 	(obj.y + obj.h), 	  obj.z ], 			// 5
        [ obj.x, 			      obj.y, 				      obj.z ], 			// 6
        [ (obj.x + obj.w), 	obj.y, 				      obj.z ] 			// 7
    ];

    // console.log(verts);

    const vertices = [

        // front: 0 1 2 3
        verts[0],
        verts[1],
        verts[2],
        verts[3],

        // left: 1 4 3 6
        verts[1],
        verts[4],
        verts[3],
        verts[6],

        // back: 4 5 6 7
        verts[4],
        verts[5],
        verts[6],
        verts[7],

        // right: 5 0 7 2
        verts[5],
        verts[0],
        verts[7],
        verts[2],

        // top: 4 1 5 0
        verts[4],
        verts[1],
        verts[5],
        verts[0],

        // bottom: 3 6 2 7
        verts[3],
        verts[6],
        verts[2],
        verts[7]

    ].flat(Infinity);

    // console.log("box vertices: ", vertices);

    return new Geometry({
        position: {
            data: new Float32Array(vertices),
            size: 3
        },

        normal: {
            data: new Float32Array([
                // front
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,

                // left
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,
                -1, 0, 0,

                // back
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,
                0, 0, -1,

                // right
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,

                // top
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,

                // bottom
                0, -1, 0,
                0, -1, 0,
                0, -1, 0,
                0, -1, 0
            ]),
            size: 3
        },

        uv: {
            data: new Float32Array([
                // front
                2/4, 1/4,
                1/4, 1/4,
                2/4, 2/4,
                1/4, 2/4,

                // left
                1/4, 1/4,
                0/4, 1/4,
                1/4, 2/4,
                0/4, 2/4,

                // back
                4/4, 1/4,
                3/4, 1/4,
                4/4, 2/4,
                3/4, 2/4,

                // right
                3/4, 1/4,
                2/4, 1/4,
                3/4, 2/4,
                2/4, 2/4,

                // top
                1/4, 0/4,
                1/4, 1/4,
                2/4, 0/4,
                2/4, 1/4,

                // bottom
                1/4, 2/4,
                1/4, 3/4,
                2/4, 2/4,
                2/4, 3/4
            ]),
            size: 2
        }
    }, {
        index: new Uint32Array([
            // front
            0, 1, 2,
            3, 2, 1,

            // left
            4, 5, 6,
            6, 5, 7,

            // back
            8, 9, 10,
            11, 10, 9,

            // right
            12, 13, 14,
            15, 14, 13,

            // top
            16, 17, 18,
            19, 18, 17,

            // bottom
            20, 21, 22,
            23, 22, 21
        ])
    });
});
