import Geometry from './Geometry.mjs';
import { memoize } from '../internal/utils.mjs';

const PI = Math.PI;
const PI2 = PI * 2;

function create_smooth_geometry(turns, bands) {
	const num_vertices = (turns + 1) * (bands + 1);
	const num_faces_per_turn = 2 * (bands - 1);
	const num_faces = num_faces_per_turn * turns;

	const position = new Float32Array(num_vertices * 3); // doubles as normal
	const uv = new Float32Array(num_vertices * 2);
	const index = new Uint32Array(num_faces * 3);

	let position_index = 0;
	let uv_index = 0;

	for (let i = 0; i <= turns; i += 1) {
		const u = i / turns;

		for (let j = 0; j <= bands; j += 1) {
			const v = j / bands;

			const x = -Math.cos(u * PI2) * Math.sin(v * PI);
			const y = Math.cos(v * PI);
			const z = Math.sin(u * PI2) * Math.sin(v * PI);

			position[position_index++] = x;
			position[position_index++] = y;
			position[position_index++] = z;

			uv[uv_index++] = u;
			uv[uv_index++] = v;
		}
	}

	let face_index = 0;

	for (let i = 0; i < turns; i += 1) {
		const offset = i * (bands + 1);

		// north pole face
		index[face_index++] = offset + 0;
		index[face_index++] = offset + 1;
		index[face_index++] = offset + bands + 2;

		for (let j = 1; j < bands - 1; j += 1) {
			index[face_index++] = offset + j;
			index[face_index++] = offset + j + 1;
			index[face_index++] = offset + j + bands + 1;

			index[face_index++] = offset + j + bands + 1;
			index[face_index++] = offset + j + 1;
			index[face_index++] = offset + j + bands + 2;
		}

		index[face_index++] = offset + bands - 1;
		index[face_index++] = offset + bands;
		index[face_index++] = offset + bands * 2;
	}

	return new Geometry({
		position: {
			data: position,
			size: 3
		},
		normal: {
			data: position,
			size: 3
		},
		uv: {
			data: uv,
			size: 2
		}
	}, {
		index
	});
}

function create_flat_geometry(turns, bands) {
	throw new Error('TODO implement flat geometry');
}

export default memoize(({ turns = 8, bands = 6, shading = 'smooth' } = {}) => {
	return shading === 'smooth'
		? create_smooth_geometry(turns, bands)
		: create_flat_geometry(turns, bands);
});