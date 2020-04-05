class GeometryInstance {
	constructor(scene, program, attributes, index, primitive, count) {
		this.scene = scene;
		const gl = scene.gl;

		this.attributes = attributes;
		this.index = index;
		this.primitive = primitive;
		this.count = count;

		this.locations = {};
		this.buffers = {};

		for (const key in attributes) {
			const attribute = attributes[key];

			this.locations[key] = gl.getAttribLocation(program, key);
			if (this.primitive === 'POINTS') console.log(key, ":", attribute);

			const buffer = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, attribute.data, attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
			this.buffers[key] = buffer;
		}

		if (index) {
			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
			this.buffers.__index = buffer;
		}
		
		// Un-bind buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
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
			
			if (this.primitive = 'POINTS') console.log("enableVertexAttribArray on location ", key);

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

	update(k, data, count) {
		const scene = this.scene;
		const { gl } = scene;

		const attribute = this.attributes[k];
		const buffer = this.buffers[k];

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, attribute.data = data, attribute.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);

		this.count = count;

		if (count === Infinity) {
			throw new Error(`GL.Geometry must be instantiated with one or more { data, size } attributes`);
		}

		scene.invalidate();
	}
}

export default class Geometry {
	constructor(attributes = {}, opts = {}) {
		this.attributes = attributes;

		const { index, primitive = 'TRIANGLES' } = opts;
		this.index = index;
		this.primitive = primitive.toUpperCase();
		this.count = get_count(attributes);

		this.instances = new Map();
	}

	instantiate(scene, program) {
		if (!this.instances.has(program)) {
			this.instances.set(program, new GeometryInstance(
				scene,
				program,
				this.attributes,
				this.index,
				this.primitive,
				this.count
			));
		}

		return this.instances.get(program);
	}

	update(k, data) {
		this.attributes[k].data = data;
		this.count = get_count(this.attributes);

		this.instances.forEach(instance => {
			instance.update(k, data, this.count);
		});
	}
}

function get_count(attributes) {
	let min = Infinity;

	for (const k in attributes) {
		const count = attributes[k].data.length / attributes[k].size;
		if (count < min) min = count;
	}

	return min;
}
