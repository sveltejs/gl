import * as yootils from 'yootils';

export default class Texture {
	constructor({ img } = {}) {
		this._img = img || yootils.createSprite(1, 1, ctx => {
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, 1, 1);
		});
	}

	init(gl) {
		this.gl = gl;
		this.texture = gl.createTexture();
		this.bind();
	}

	bind() {
		const { gl } = this;

		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// Fill the texture with a 1x1 black pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._img);
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	get img() {
		return this._img;
	}

	set img(img) {
		this._img = img;
		this.bind(); // TODO do we need to unbind previous texture?
	}
}