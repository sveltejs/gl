import Attribute from './Attribute.mjs';
import * as vec2 from 'gl-matrix/vec2';
import * as vec3 from 'gl-matrix/vec3';

const builtins = new Set(['position', 'normal', 'uv']);

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