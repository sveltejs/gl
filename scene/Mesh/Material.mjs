import vert_builtin from './shaders/builtin/vert.glsl';
import frag_builtin from './shaders/builtin/frag.glsl';
import { compile } from './program.mjs';
import { process_color } from '../../internal/utils.mjs';

function deep_set(obj, path, value) {
	const parts = path.replace(/\]$/, '').split(/\[|\]\.|\./);

	while (parts.length > 1) {
		const part = parts.shift();
		const next = parts[0];

		if (!obj[part]) obj[part] = /^\d+$/.test(next) ? [] : {};
		obj = obj[part];
	}

	obj[parts[0]] = value;
}

function is_image_data(data) {
	return (
		data instanceof HTMLImageElement ||
		data instanceof HTMLCanvasElement ||
		data instanceof HTMLVideoElement ||
		data instanceof ImageBitmap ||
		data instanceof ImageData ||
		ArrayBuffer.isView(data)
	);
}

export default class Material {
	constructor(scene, vert, frag, defines) {
		this.scene = scene;

		const gl = scene.gl;
		this.gl = gl;

		const { program, uniforms, attributes } = compile(
			gl,
			defines + '\n\n' + vert_builtin + '\n\n' + vert,
			defines + '\n\n' + frag_builtin + '\n\n' + frag
		);

		this.program = program;
		this.uniforms = uniforms;
		this.attributes = attributes;

		this.uniform_locations = {};
		this.uniforms.forEach(uniform => {
			deep_set(this.uniform_locations, uniform.name, gl.getUniformLocation(this.program, uniform.name));
		});

		this.attribute_locations = {};
		this.attributes.forEach(attribute => {
			this.attribute_locations[attribute.name] = gl.getAttribLocation(this.program, attribute.name);
		});

		this.raw_values = {};
		this.values = {};
	}

	set_uniforms(raw_values) {
		const token = this.token = {};

		this.uniforms.forEach(({ name, type, loc, setter, processor }) => {
			if (name in raw_values) {
				let data = raw_values[name];

				if (data === this.raw_values[name]) return;

				if (type === 35678) {
					// texture
					if (typeof data === 'string') {
						this.values[name] = null; // TODO replace with blank texture

						this.scene.load_image(data).then(data => {
							if (token !== this.token) return;
							this.values[name] = data;
							this.scene.invalidate();
						});
					} else if (is_image_data(data)) {
						this.values[name] = data;
					} else {
						// TODO figure out how to package up mipmap/type options etc
						throw new Error(`TODO`);
					}

					return;
				}

				if (typeof data === 'number' && type !== 5126) {
					// data provided was a number like 0x123456,
					// but it needs to be an array. for now,
					// assume it's a color, i.e. vec3
					data = process_color(data);
				}

				this.values[name] = data;
			}
		});

		this.raw_values = raw_values;

		// const { gl } = this;

		// const token = this.token = {};
		// this.setters = [];

		// let texture_index = 0;

		// const add_setter = (name, setter, loc, data) => {
		// 	const fn = () => setter(gl, loc, data);
		// 	this.setter_lookup.set(name, fn);
		// 	this.setters.push(fn);
		// };

		// const add_image = (name, setter, loc, img) => {
		// 	const data = {
		// 		constant: `TEXTURE${texture_index}`,
		// 		index: texture_index++,
		// 		texture: gl.createTexture()
		// 	};

		// 	gl.bindTexture(gl.TEXTURE_2D, data.texture);

		// 	// TODO make all this configurable
		// 	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		// 	gl.generateMipmap(gl.TEXTURE_2D);

		// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		// 	add_setter(name, setter, loc, data);
		// };

		// this.uniforms.forEach(({ name, type, loc, setter, processor }) => {
		// 	if (name in uniforms) {
		// 		let data = uniforms[name];

		// 		if (data === this.uniform_values[name]) {
		// 			this.setters.push(this.setter_lookup.get(name));
		// 			return;
		// 		}

		// 		if (type === 35678) {
		// 			// texture
		// 			if (typeof data === 'string') {
		// 				this.scene.load_image(data).then(data => {
		// 					if (token !== this.token) return;
		// 					add_image(name, setter, loc, data);
		// 					this.scene.invalidate();
		// 				});
		// 			} else if (is_image_data(data)) {
		// 				add_image(name, setter, loc, data);
		// 			} else {
		// 				// TODO figure out how to package up mipmap/type options etc
		// 				throw new Error(`TODO`);
		// 			}

		// 			return;
		// 		}

		// 		if (typeof data === 'number' && type !== 5126) {
		// 			// data provided was a number like 0x123456,
		// 			// but it needs to be an array. for now,
		// 			// assume it's a color, i.e. vec3
		// 			data = process_color(data);
		// 		}

		// 		add_setter(name, setter, loc, data);
		// 	}
		// });

		// this.uniform_values = uniforms;
	}

	apply_uniforms(gl, builtins) {
		// TODO if this is the only program, maybe
		// we don't need to re-run this each time
		this.uniforms.forEach(uniform => {
			if (uniform.name in this.values) {
				console.log('applying', uniform);
			}
		});
	}

	destroy() {
		// TODO
	}
}