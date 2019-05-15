import vert from './shaders/default/vert.glsl';
import frag from './shaders/default/frag.glsl';
import { get_program } from './program.mjs';

const methods = {
	[5126]: 'uniform1f',
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
		this._map = opts.map;
		this._specMap = opts.specMap;
		this._bumpMap = opts.bumpMap;

		this._textures = {};

		this.blend = opts.blend;

		this._update_hash();
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

		this._textures[id] = texture;

		this._update_hash();
	}

	_update_hash() {
		// TODO make this real — https://github.com/mrdoob/three.js/blob/f186b20983e07564d62fb0c067726931c28d92f6/src/renderers/webgl/WebGLPrograms.js#L218
		// this.hash = Math.random().toString(36).slice(2);

		this.hash = bitmask([
			this.alpha < 1,
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

		if (this.alpha < 1) {
			gl.uniform1f(locations.ALPHA, this.alpha);
		}

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