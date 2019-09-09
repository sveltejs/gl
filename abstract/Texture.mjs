import * as constants from '../internal/constants.mjs';
import { load_image } from '../internal/image.mjs';

const is_power_of_two = n => (n & (n - 1)) === 0;

const black_pixel = new Uint8Array([0, 0, 0, 255]);

class TextureInstance {
	constructor(scene, texture) {
		const { gl } = scene;

		this._ = gl.createTexture();

		if (typeof texture.data === 'string') {
			this.bind(gl, texture, black_pixel);

			this.ready.then(() => {
				this.bind(gl, texture, texture.data);
				scene.invalidate();
			});
		} else {
			this.ready = resolved || (resolved = Promise.resolve());
			this.bind(gl, texture, texture.data);
		}
	}

	bind(gl, texture, data) {
		gl.bindTexture(constants.TEXTURE_2D, this._);

		if (ArrayBuffer.isView(data)) {
			// TODO figure out where this goes
			const width = 1;
			const height = 1;

			gl.texImage2D(constants.TEXTURE_2D, 0, constants.RGBA, width, height, 0, constants.RGBA, constants.UNSIGNED_BYTE, data);
		} else {
			gl.texImage2D(constants.TEXTURE_2D, 0, constants.RGBA, constants.RGBA, constants.UNSIGNED_BYTE, data);
		}

		const width  = 'naturalWidth'  in data ? data.naturalWidth  : data.width;
		const height = 'naturalHeight' in data ? data.naturalHeight : data.height;

		if (is_power_of_two(width) && is_power_of_two(height)) {
			gl.generateMipmap(constants.TEXTURE_2D);

			gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, texture.opts.wrapS);
			gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, texture.opts.wrapT);
			gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, texture.opts.minFilter);
		} else {
			gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, constants.CLAMP_TO_EDGE);
			gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, constants.CLAMP_TO_EDGE);
			gl.texParameteri(constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, constants.LINEAR);
		}
	}
}

const caches = new Map();
let resolved;

export default class Texture {
	constructor(data, opts = {}) {
		this.data = data;

		this.opts = {
			width:          opts.width     || 1,
			height:         opts.height    || 1,
			internalFormat: opts.format    || constants.RGBA,
			srcFormat:      opts.srcFormat || constants.RGBA,
			srcType:        opts.srcType   || constants.UNSIGNED_BYTE,
			wrapS:          opts.wrapS     || constants.CLAMP_TO_EDGE,
			wrapT:          opts.wrapT     || constants.CLAMP_TO_EDGE,
			minFilter:      opts.minFilter || constants.LINEAR
		};

		// TODO clamp, mipmaps, etc

		this.hash = JSON.stringify(this.opts);

		this.ready = typeof data === 'string'
			? load_image(data).then(img => {
				this.data = img;
			})
			: resolved || (resolved = Promise.resolve());
	}

	instantiate(scene, index) {
		if (!caches.has(scene)) caches.set(scene, new Map());
		const a = caches.get(scene);

		if (!a.has(this.data)) a.set(this.data, new Map());
		const b = a.get(this.data);

		if (!b.has(this.hash)) b.set(this.hash, new TextureInstance(scene, this, index));
		return b.get(this.hash);
	}
}