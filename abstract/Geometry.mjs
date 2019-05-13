const builtins = new Set(['position', 'normal', 'uv']);

export default class Geometry {
	constructor(attributes = {}, opts = {}) {
		this.attributes = attributes;

		const { index, primitive = 'TRIANGLES' } = opts;
		this.index = index;
		this.primitive = primitive;

		this.locations = {};
		this.buffers = {};
	}

	init(gl, program) {
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
	set_attributes(gl) {
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

	get_attribute(name) {
		return this.attributes[name];
	}

	set_attribute(name, attribute) {
		this.attributes[name] = attribute;
	}
}