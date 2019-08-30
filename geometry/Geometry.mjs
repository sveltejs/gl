class GeometryInstance {
	constructor(gl, program, attributes, index, primitive) {
		this.attributes = attributes;
		this.index = index;
		this.primitive = primitive;

		this.locations = {};
		this.buffers = {};

		for (const key in attributes) {
			const attribute = attributes[key];

			this.locations[key] = gl.getAttribLocation(program, key);

			const buffer = gl.createBuffer();
			this.buffers[key] = buffer;

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, attribute.data, attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
		}

		if (index) {
			const buffer = gl.createBuffer();
			this.buffers.__index = buffer;
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
		}
	}

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
}

export default class Geometry {
	constructor(attributes = {}, opts = {}) {
		this.attributes = attributes;

		const { index, primitive = 'TRIANGLES' } = opts;
		this.index = index;
		this.primitive = primitive.toUpperCase();

		this.instances = new Map();
	}

	instantiate(gl, program) {
		if (!this.instances.has(program)) {
			this.instances.set(program, new GeometryInstance(
				gl,
				program,
				this.attributes,
				this.index,
				this.primitive
			));
		}

		return this.instances.get(program);
	}
}