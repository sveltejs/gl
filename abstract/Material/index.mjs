import vert from './shaders/default/vert.glsl';
import frag from './shaders/default/frag.glsl';
import { get_program } from './program.mjs';

const methods = {
	[5126]: 'uniform1f',
	[35664]: 'uniform2fv',
	[35665]: 'uniform3fv',
	[35666]: 'uniform4fv',

	// [35678]: 'texImage2D'
};

function bitmask(things) {
	let mask = 0;
	things.forEach((thing, i) => {
		if (thing) mask |= 1 << i;
	});
	return mask;
}

export default class Material {
	constructor(opts = {}) {
		this.vert = opts.vert || vert;
		this.frag = opts.frag || frag;

		// custom uniforms
		this.uniforms = opts.uniforms;

		this.color = opts.color;
		this.alpha = opts.alpha;
		this.specularity = opts.specularity;
		this.depthTest = 'depthTest' in opts ? opts.depthTest : true;

		this._textures = {};

		this.blend = opts.blend;

		this._update_hash();
	}

	// TODO this feels a lil messy
	oninvalid(callback) {
		this._oninvalid = callback;
		callback(this);
	}

	invalidate() {
		this._oninvalid(this);
	}

	set_image(id, img) {
		const { gl } = this;

		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap(gl.TEXTURE_2D);

		// TODO make this configurable
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

		this._textures[id] = texture;

		this._update_hash();

		this.invalidate();
	}

	_update_hash() {
		// TODO can we combine this logic with defines?
		this.hash = bitmask([
			this.alpha !== undefined,
			this.specularity !== undefined,
			!!this._textures.map,
			!!this._textures.specMap,
			!!this._textures.bumpMap,
			!!this._textures.normalMap
		]) + this.vert + this.frag;
	}

	_compile(gl) {
		this.gl = gl;

		return get_program(gl, this);
	}

	_set_uniforms(gl, uniforms, locations) {
		if (this.color) {
			gl.uniform3fv(locations.COLOR, this.color);
		}

		gl.uniform1f(locations.ALPHA, this.alpha === undefined ? 1 : this.alpha);
		gl.uniform1f(locations.SPECULARITY, this.specularity === undefined ? 1 : this.specularity);

		if (this._textures.map) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this._textures.map);
			gl.uniform1i(locations.COLOR_MAP, 0);
		}

		if (this._textures.specMap) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this._textures.specMap);
			gl.uniform1i(locations.SPEC_MAP, 1);
		}

		if (this._textures.bumpMap) {
			gl.uniform1f(locations.BUMP_SCALE, this.bumpScale === undefined ? 1 : this.bumpScale);

			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this._textures.bumpMap);
			gl.uniform1i(locations.BUMP_MAP, 2);
		}

		if (this._textures.normalMap) {
			gl.activeTexture(gl.TEXTURE3);
			gl.bindTexture(gl.TEXTURE_2D, this._textures.normalMap);
			gl.uniform1i(locations.NORMAL_MAP, 3);
		}

		// custom uniforms
		if (this.uniforms) {
			uniforms.forEach(uniform => {
				if (uniform.name in this.uniforms) {
					const data = this.uniforms[uniform.name];

					const method = methods[uniform.type];
					if (!method) {
						console.log(uniform.name, data, uniform);
						throw new Error(`not implemented ${uniform.type}`);
					}

					gl[method](locations[uniform.name], data);
				}
			});
		}
	}
}