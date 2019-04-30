export default class Attribute {
	constructor({ data, size = 3, normalized = false, dynamic = false }) {
		this.data = data;
		this.size = size;
	}

	get count() {
		return this.data.length / this.size;
	}
}