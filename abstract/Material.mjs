import vert from '../shaders/default/vert.glsl.mjs';
import frag from '../shaders/default/frag.glsl.mjs';

const methods = {
	[5126]: 'uniform1f',
	[35665]: 'uniform3fv',
	[35666]: 'uniform4fv',

	// [35678]: 'texImage2D'
};

export default class Material {
	constructor(opts) {
		this.vert = opts.vert || vert;
		this.frag = opts.frag || frag;

		this.uniforms = opts.uniforms || {};

		this.blend = opts.blend;

		// TODO make this real — https://github.com/mrdoob/three.js/blob/f186b20983e07564d62fb0c067726931c28d92f6/src/renderers/webgl/WebGLPrograms.js#L218
		// this.hash = Math.random().toString(36).slice(2);
		this.hash = Object.keys(this.uniforms).join(',') + this.vert + this.frag;
	}

	init(gl) {
		// TODO this feels a bit weird, maybe there's a
		// better place for this work?
		if (this.uniforms.texture) {
			this.uniforms.texture.init(gl);
		}
	}

	set_uniforms(gl, uniforms, locations) {
		uniforms.forEach(uniform => {
			const data = this.uniforms[uniform.name.toLowerCase()];
			if (!data) return;

			const loc = locations[uniform.name];

			if (uniform.type === gl.SAMPLER_2D) {
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, data.texture);
				gl.uniform1i(loc, 0);
				return;
			}

			const method = methods[uniform.type];
			if (!method) {
				console.log(uniform);
				throw new Error(`TODO implement figure out method for ${uniform.type}`)
			}

			gl[method](loc, data);
		});
	}
}