import Geometry from './Geometry.mjs';
import { memoize } from '../internal/utils.mjs';

export default memoize(() => {
	let pos = 0.5;
	let neg = -0.5;

	return new Geometry({
		position: {
			data: new Float32Array([
				// front
				pos, pos, pos,
				neg, pos, pos,
				pos, neg, pos,
				neg, neg, pos,

				// left
				neg, pos, pos,
				neg, pos, neg,
				neg, neg, pos,
				neg, neg, neg,

				// back
				neg, pos, neg,
				pos, pos, neg,
				neg, neg, neg,
				pos, neg, neg,

				// right
				pos, pos, neg,
				pos, pos, pos,
				pos, neg, neg,
				pos, neg, pos,

				// top
				neg, pos, neg,
				neg, pos, pos,
				pos, pos, neg,
				pos, pos, pos,

				// bottom
				neg, neg, pos,
				neg, neg, neg,
				pos, neg, pos,
				pos, neg, neg
			]),
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