import vert from '../shaders/default/vert.glsl.mjs';
import frag from '../shaders/default/frag.glsl.mjs';

const methods = {
	[5126]: 'uniform1f',
	[35666]: 'uniform4fv',

	[35676]: ''
};

export default class Material {
	constructor(opts) {
		this.vert = opts.vert || vert;
		this.frag = opts.frag || frag;

		this.uniforms = opts.uniforms || {};

		// TODO make this real — https://github.com/mrdoob/three.js/blob/f186b20983e07564d62fb0c067726931c28d92f6/src/renderers/webgl/WebGLPrograms.js#L218
		this.hash = Math.random().toString(36).slice(2);
	}

	set_uniforms(gl, uniforms, locations) {
		uniforms.forEach(uniform => {
			const data = this.uniforms[uniform.name.toLowerCase()];
			if (!data) return;

			const method = methods[uniform.type];
			if (!method) {
				console.log(uniform);
				throw new Error(`TODO implement figure out method for ${uniform.type}`)
			}

			const loc = locations[uniform.name];

			gl[method](loc, data);
		});
	}
}