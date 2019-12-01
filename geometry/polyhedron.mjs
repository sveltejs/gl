import Geometry from './Geometry.mjs';
import { memoize, normalize } from '../internal/utils.mjs';

// adapted from https://github.com/mrdoob/three.js/blob/master/src/geometries/PolyhedronGeometry.js
// MIT licensed https://github.com/mrdoob/three.js/blob/dev/LICENSE

function lerp(a, b, t) {
	return a.map((aa, i) => {
		const bb = b[i];
		return aa + (bb - aa) * t;
	});
}

function set2(vector, a, b) {
	vector[0] = a;
	vector[1] = b;
}

function set3(vector, a, b, c) {
	vector[0] = a;
	vector[1] = b;
	vector[2] = c;
}

function correct_uvs(vertex_buffer, uv_buffer) {
	const a = new Float32Array(3);
	const b = new Float32Array(3);
	const c = new Float32Array(3);

	const centroid = new Float32Array(3);

	const uv_a = new Float32Array(2);
	const uv_b = new Float32Array(2);
	const uv_c = new Float32Array(2);

	for (let i = 0, j = 0; i < vertex_buffer.length; i += 9, j += 6) {
		set3(a, vertex_buffer[i + 0], vertex_buffer[i + 1], vertex_buffer[i + 2]);
		set3(b, vertex_buffer[i + 3], vertex_buffer[i + 4], vertex_buffer[i + 5]);
		set3(c, vertex_buffer[i + 6], vertex_buffer[i + 7], vertex_buffer[i + 8]);

		set2(uv_a, uv_buffer[j + 0], uv_buffer[j + 1]);
		set2(uv_b, uv_buffer[j + 2], uv_buffer[j + 3]);
		set2(uv_c, uv_buffer[j + 4], uv_buffer[j + 5]);

		centroid[0] = (a[0] + b[0] + c[0]) / 3;
		centroid[1] = (a[1] + b[1] + c[1]) / 3;
		centroid[2] = (a[2] + b[2] + c[2]) / 3;

		const azi = azimuth(centroid);

		correct_uv(uv_buffer, uv_a, j + 0, a, azi);
		correct_uv(uv_buffer, uv_b, j + 2, b, azi);
		correct_uv(uv_buffer, uv_c, j + 4, c, azi);
	}
}

function correct_uv(uv_buffer, uv, stride, vector, azimuth) {
	if ((azimuth < 0) && (uv[0] === 1)) {
		uv_buffer[stride] = uv[0] - 1;
	}

	if ((vector[0] === 0) && (vector[2] === 0)) {
		uv_buffer[stride] = azimuth / 2 / Math.PI + 0.5;
	}
}

function correct_seam(uv_buffer) {
	// handle case when face straddles the seam
	for (var i = 0; i < uv_buffer.length; i += 6) {
		// uv data of a single face
		var x0 = uv_buffer[i + 0];
		var x1 = uv_buffer[i + 2];
		var x2 = uv_buffer[i + 4];

		var max = Math.max(x0, x1, x2);
		var min = Math.min(x0, x1, x2);

		// 0.9 is somewhat arbitrary
		if (max > 0.9 && min < 0.1) {
			if (x0 < 0.2) uv_buffer[i + 0] += 1;
			if (x1 < 0.2) uv_buffer[i + 2] += 1;
			if (x2 < 0.2) uv_buffer[i + 4] += 1;
		}
	}
}

// Angle around the Y axis, counter-clockwise when looking from above.
function azimuth(vector) {
	return Math.atan2(vector[2], - vector[0]);
}

// Angle above the XZ plane.
function inclination(vector) {
	return Math.atan2(-vector[1], Math.sqrt((vector[0] * vector[0]) + (vector[2] * vector[2])));
}

function compute_vertex_normals(position) {
	const cb = new Float32Array(3);
	const ab = new Float32Array(3);

	const normals = new Float32Array(position.length);

	for (let i = 0; i < position.length; i += 9 ) {
		const pa = position.subarray(i + 0, i + 3);
		const pb = position.subarray(i + 3, i + 6);
		const pc = position.subarray(i + 6, i + 9);

		set3(cb, pc[0] - pb[0], pc[1] - pb[1], pc[2] - pb[2]);
		set3(ab, pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);

		// cb x ab
		const x = cb[1] * ab[2] - cb[2] * ab[1];
		const y = cb[2] * ab[0] - cb[0] * ab[2];
		const z = cb[0] * ab[1] - cb[1] * ab[0];

		normals[i + 0] = normals[i + 3] = normals[i + 6] = x;
		normals[i + 1] = normals[i + 4] = normals[i + 7] = y;
		normals[i + 2] = normals[i + 5] = normals[i + 8] = z;
	}

	return normals;
}

function create_vertex_buffer(vertices, indices, subdivisions) {
	const vertex_buffer = [];

	const a = new Float32Array(3);
	const b = new Float32Array(3);
	const c = new Float32Array(3);

	for (let i = 0; i < indices.length; i += 3) {
		// get the vertices of the face
		get_vertex_data(indices[i + 0], a);
		get_vertex_data(indices[i + 1], b);
		get_vertex_data(indices[i + 2], c);

		// perform subdivision
		subdivide_face(a, b, c, subdivisions);
	}

	function get_vertex_data(index, out) {
		const offset = index * 3;

		out[0] = vertices[offset + 0];
		out[1] = vertices[offset + 1];
		out[2] = vertices[offset + 2];
	}

	function push_vertex(vertex) {
		vertex_buffer.push(vertex[0], vertex[1], vertex[2]);
	}

	function subdivide_face(a, b, c, subdivisions) {
		const cols = Math.pow(2, subdivisions);

		// we use this multidimensional array as a data structure for creating the subdivision
		const v = [];

		// construct all of the vertices for this subdivision
		for (let i = 0; i <= cols; i++) {
			v[i] = [];

			const aj = lerp(a, c, i / cols);
			const bj = lerp(b, c, i / cols);

			const rows = cols - i;

			for (let j = 0; j <= rows; j++) {
				if (j === 0 && i === cols) {
					v[i][j] = aj;
				} else {
					v[i][j] = lerp(aj, bj, j / rows);
				}
			}
		}

		// construct all of the faces
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < 2 * (cols - i) - 1; j++) {
				const k = Math.floor(j / 2);

				if (j % 2 === 0) {
					push_vertex(v[i][k + 1]);
					push_vertex(v[i + 1][k]);
					push_vertex(v[i][k]);
				} else {
					push_vertex(v[i][k + 1]);
					push_vertex(v[i + 1][k + 1]);
					push_vertex(v[i + 1][k]);
				}
			}
		}
	}

	return new Float32Array(vertex_buffer);
}

export default memoize((vertices, indices, subdivisions = 0, shading = 'flat') => {
	var uv_buffer = [];

	// the subdivision creates the vertex buffer data
	const vertex_buffer = create_vertex_buffer(vertices, indices, subdivisions);

	for (let i = 0; i < vertex_buffer.length; i += 3) {
		const vertex = new Float32Array(vertex_buffer.buffer, i * 4, 3);

		// all vertices should lie on a conceptual sphere with a given radius
		normalize(vertex);

		var u = azimuth(vertex) / 2 / Math.PI + 0.5;
		var v = inclination(vertex) / Math.PI + 0.5;
		uv_buffer.push(u, 1 - v);
	}

	correct_uvs(vertex_buffer, uv_buffer);
	correct_seam(uv_buffer);

	const position_buffer = new Float32Array(vertex_buffer);

	return new Geometry({
		position: {
			data: position_buffer,
			size: 3
		},

		normal: {
			data: shading === 'smooth' ? position_buffer : compute_vertex_normals(position_buffer),
			size: 3
		},

		uv: {
			data: new Float32Array(uv_buffer),
			size: 2
		}
	});
});