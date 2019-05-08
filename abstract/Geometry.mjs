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
			this.locations[key] = gl.getAttribLocation(program, builtins.has(key) ? key.toUpperCase() : key);
			if (!this.buffers[key]) this.buffers[key] = gl.createBuffer();
		}
	}

	set_attributes(gl) {
		for (const key in this.attributes) {
			const attribute = this.attributes[key];

			const {
				size = 3,
				type = gl.FLOAT,
				normalized = false,
				stride = 0,
				offset = 0,
				dynamic,
				data
			} = attribute;

			// Turn on the attribute
			const loc = this.locations[key];
			gl.enableVertexAttribArray(loc);

			// Bind the position buffer.
			const buffer = this.buffers[key];

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, data, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW); // TODO feels wrong adding the data here?

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