import Attribute from './Attribute.mjs';
import * as vec2 from 'gl-matrix/vec2';
import * as vec3 from 'gl-matrix/vec3';

const builtins = new Set(['position', 'normal', 'uv', 'tangent']);

function copy3(to, from, offset = 0) {
	to[0] = from[offset + 0];
	to[1] = from[offset + 1];
	to[2] = from[offset + 2];
}

function copy2(to, from, offset = 0) {
	to[0] = from[offset + 0];
	to[1] = from[offset + 1];
}

export default class Geometry {
	constructor(attributes = {}, opts = {}) {
		this.attributes = attributes;

		const { index, primitive = 'TRIANGLES' } = opts;
		this.index = index;
		this.primitive = primitive;

		this.locations = {};
		this.buffers = {};
	}

	_init(gl, program, material) {
		this.program = program;

		if (material._textures.normalMap) {
			this._compute_tangents();
		}

		for (const key in this.attributes) {
			const attribute = this.attributes[key];

			this.locations[key] = gl.getAttribLocation(program, builtins.has(key) ? key.toUpperCase() : key);

			const buffer = gl.createBuffer();
			if (!this.buffers[key]) this.buffers[key] = buffer;

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, attribute.data, attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
		}

		if (this.index) {
			const buffer = gl.createBuffer();
			this.buffers.__index = buffer;
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.index, gl.STATIC_DRAW);
		}
	}

	// TODO apparently this is unnecessary, we should just
	// use derivative functions?
	_compute_tangents() {
		// adapted from https://github.com/mrdoob/three.js/blob/master/examples/js/utils/BufferGeometryUtils.js
		// https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE

		const { index, attributes } = this;
		const { position, normal, uv } = attributes;

		if (!index || !position || !normal || !uv) {
			throw new Error(`Could not compute tangents — must have position, normal and uv attributes, plus an index`);
		}

		const num_vertices = position.data.length / 3;

		const tangent = this.attributes.tangent = new Attribute({
			data: new Float32Array(4 * num_vertices),
			size: 4
		});

		const tan1 = [];
		const tan2 = [];

		for (let i = 0; i < num_vertices; i++) {
			tan1[i] = vec3.create();
			tan2[i] = vec3.create();
		}

		const va = vec3.create();
		const vb = vec3.create();
		const vc = vec3.create();

		const uva = vec2.create();
		const uvb = vec2.create();
		const uvc = vec2.create();

		const sdir = vec3.create();
		const tdir = vec3.create();

		function handle_triangle(a, b, c) {
			copy3(va, position.data, a * 3);
			copy3(vb, position.data, b * 3);
			copy3(vc, position.data, c * 3);

			copy2(uva, uv.data, a * 2);
			copy2(uvb, uv.data, b * 2);
			copy2(uvc, uv.data, c * 2);

			const x1 = vb[0] - va[0];
			const x2 = vc[0] - va[0];

			const y1 = vb[1] - va[1];
			const y2 = vc[1] - va[1];

			const z1 = vb[2] - va[2];
			const z2 = vc[2] - va[2];

			const s1 = uvb[0] - uva[0];
			const s2 = uvc[0] - uva[0];

			const t1 = uvb[1] - uva[1];
			const t2 = uvc[1] - uva[1];

			const r = 1.0 / (s1 * t2 - s2 * t1);

			sdir[0] = (t2 * x1 - t1 * x2) * r;
			sdir[1] = (t2 * y1 - t1 * y2) * r;
			sdir[2] = (t2 * z1 - t1 * z2) * r;

			tdir[0] = (s1 * x2 - s2 * x1) * r;
			tdir[1] = (s1 * y2 - s2 * y1) * r;
			tdir[2] = (s1 * z2 - s2 * z1) * r;

			vec3.add(tan1[a], tan1[a], sdir);
			vec3.add(tan1[b], tan1[b], sdir);
			vec3.add(tan1[c], tan1[c], sdir);

			vec3.add(tan2[a], tan2[a], tdir);
			vec3.add(tan2[b], tan2[b], tdir);
			vec3.add(tan2[c], tan2[c], tdir);
		}

		for (let i = 0; i < index.length; i += 3) {
			handle_triangle(index[i + 0], index[i + 1], index[i + 2]);
		}

		const tmp = vec3.create();
		const tmp2 = vec3.create();
		const n = vec3.create();
		const n2 = vec3.create();

		function handle_vertex(v) {
			copy3(n, normal.data, v * 3);
			copy3(n2, n, 0);

			const t = tan1[v];

			// Gram-Schmidt orthogonalize
			copy3(tmp, t);

			const tmp3 = vec3.create();
			vec3.scale(tmp3, n, vec3.dot(n, t));
			vec3.sub(tmp, tmp, tmp3);
			vec3.normalize(tmp, tmp);

			// Calculate handedness
			vec3.cross(tmp2, n2, t);
			const test = vec3.dot(tmp2, tan2[v]);
			const w = (test < 0.0) ? - 1.0 : 1.0;

			tangent.data[v * 4 + 0] = tmp[0];
			tangent.data[v * 4 + 1] = tmp[1];
			tangent.data[v * 4 + 2] = tmp[2];
			tangent.data[v * 4 + 3] = w;
		}

		for (let i = 0; i < index.length; i += 3) {
			handle_vertex(index[i + 0]);
			handle_vertex(index[i + 1]);
			handle_vertex(index[i + 2]);
		}
	}

	// TODO should this be a public method?
	_set_attributes(gl) {
		for (const key in this.attributes) {
			const attribute = this.attributes[key];

			const loc = this.locations[key];
			if (loc < 0) continue; // attribute is unused by current program

			const {
				size = 3,
				type = gl.FLOAT,
				normalized = false,
				stride = 0,
				offset = 0
			} = attribute;

			// Bind the position buffer.
			const buffer = this.buffers[key];

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

			// Turn on the attribute
			gl.enableVertexAttribArray(loc);

			gl.vertexAttribPointer(
				loc,
				size,
				type,
				normalized,
				stride,
				offset
			);
		}
	}
}