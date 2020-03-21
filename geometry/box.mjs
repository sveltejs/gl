import Geometry from './Geometry.mjs';
import { memoize } from '../internal/utils.mjs';

export default memoize((x=-0.5, y=0.0, z=0.5, w=1.0, h=1.0, d=1.0) => {
	let pos = 0.5;
	let neg = -0.5;
	let verts = [
		[ pos, pos, pos ], 	// 0
		[ neg, pos, pos ], 	// 1
		[ pos, neg, pos ], 	// 2
		[ neg, neg, pos ], 	// 3
		[ neg, pos, neg ], 	// 4
		[ pos, pos, neg ], 	// 5
		[ neg, neg, neg ], 	// 6
		[ pos, neg, neg ] 	// 7
	]

	return new Geometry({
		position: {
			data: new Float32Array([
				// front
				verts[0],
				verts[1],
				verts[2],
				verts[3],

				// left
				verts[1],
				verts[4],
				verts[3],
				verts[6],

				// back
				verts[4],
				verts[5],
				verts[6],
				verts[7],

				// right
				verts[5],
				verts[0],
				verts[7],
				verts[2],

				// top
				verts[4],
				verts[1],
				verts[5],
				verts[0],

				// bottom
				verts[3],
				verts[6],
				verts[2],
				verts[7]
			].flat(Infinity)),
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
			7, 6, 5,

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
