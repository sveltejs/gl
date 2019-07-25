import vert_builtin from './shaders/builtin/vert.glsl';
import frag_builtin from './shaders/builtin/frag.glsl';
import vert_default from './shaders/default/vert.glsl';
import frag_default from './shaders/default/frag.glsl';
import { create_program, get_uniforms, get_attributes } from './program.mjs';
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
	constructor(scene, defines, vert = vert_default, frag = frag_default) {
		this.scene = scene;

		const gl = scene.gl;
		this.gl = gl;

		// TODO share programs between materials
		this.program = create_program(
			gl,
			defines + '\n\n' + vert_builtin + '\n\n' + vert,
			defines + '\n\n' + frag_builtin + '\n\n' + frag
		);

		this.uniforms = get_uniforms(gl, this.program);
		this.attributes = get_attributes(gl, this.program);

		this.uniform_locations = {};
		this.uniforms.forEach(uniform => {
			deep_set(this.uniform_locations, uniform.name, gl.getUniformLocation(this.program, uniform.name));
		});

		this.attribute_locations = {};
		this.attributes.forEach(attribute => {
			this.attribute_locations[attribute.name] = gl.getAttribLocation(this.program, attribute.name);
		});

		this.setters = [];
	}

	set_uniforms(uniforms) {
		const { gl } = this;

		const token = this.token = {};
		this.setters = [];

		let texture_index = 0;

		const add_image = (setter, loc, img) => {
			const data = {
				constant: `TEXTURE${texture_index}`,
				index: texture_index++,
				texture: gl.createTexture()
			};

			gl.bindTexture(gl.TEXTURE_2D, data.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.generateMipmap(gl.TEXTURE_2D);

			// TODO make this configurable
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			this.setters.push(() => setter(gl, loc, data));
		};

		this.uniforms.forEach(({ name, type, loc, setter, processor }) => {
			if (name in uniforms) {
				let data = uniforms[name];

				if (type === 35678) {
					// texture
					if (typeof data === 'string') {
						this.scene.load_image(data).then(data => {
							if (token !== this.token) return;
							add_image(setter, loc, data);
						});
					} else if (is_image_data(data)) {
						add_image(setter, loc, data);
					} else {
						// TODO figure out how to package up mipmap/type options etc
						throw new Error(`TODO`);
					}

					return;
				}

				if (typeof data === 'number' && type !== 5126) {
					// data provided was a number like 0x123456,
					// but it needs to be an array
					data = process_color(data);
				}

				this.setters.push(() => setter(gl, loc, data));
			}
		});
	}

	apply_uniforms(gl) {
		this.setters.forEach(fn => fn());
	}

	destroy() {
		// TODO
	}
}