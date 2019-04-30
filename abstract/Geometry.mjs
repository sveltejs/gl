export default class Geometry {
	constructor(attributes = {}, opts = {}) {
		this.attributes = attributes;

		const { index, primitive = 'TRIANGLES' } = opts;
		this.index = index;
		this.primitive = primitive;
	}

	get_attribute(name) {
		return this.attributes[name];
	}

	set_attribute(name, attribute) {
		this.attributes[name] = attribute;
	}
}