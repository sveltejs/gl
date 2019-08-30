import Geometry from './Geometry.mjs';
import { memoize } from '../internal/utils.mjs';

export default memoize(() => {
	return new Geometry({
		position: {
			data: new Float32Array([
				 1,  1, 0,
				-1,  1, 0,
				 1, -1, 0,
				-1, -1, 0,
			]),
			size: 3
		},

		normal: {
			data: new Float32Array([
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
			]),
			size: 3
		},

		uv: {
			data: new Float32Array([
				1, 0,
				0, 0,
				1, 1,
				0, 1
			]),
			size: 2
		}
	}, {
		index: new Uint32Array([
			0, 1, 2,
			3, 2, 1
		])
	});
});