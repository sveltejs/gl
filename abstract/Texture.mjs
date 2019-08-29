class TextureInstance {

}

export default class Texture {
	constructor(data, opts) {
		if (typeof data === 'string') {

		}

		this.ready = typeof data !== 'string';
		this.data = data;
	}

	instantiate(scene) {

	}
}