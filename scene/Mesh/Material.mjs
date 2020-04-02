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

export default class Material {
	constructor(scene, vert, frag, defines) {
		this.scene = scene;

		const gl = scene.gl;
		this.gl = gl;

		const { program, uniforms, attributes } = compile(
			gl,
			'#version 300 es' + '\n\n' + scene.defines + defines + '\n\n' + vert_builtin + '\n\n' + vert,
			'#version 300 es' + '\n\n' + scene.defines + defines + '\n\n' + frag_builtin + '\n\n' + frag
		);

		console.log(vert.match(/(?:NAME\s)(.+)/g));

		this.vertName = (vert.match(/(?:NAME\s)(.+)/g) !== null) ?
			vert.match(/(?:NAME\s)(.+)/g)[0].substr(5) :
			"default";

		this.fragName = (frag.match(/(?:NAME\s)(.+)/g) !== null) ?
			frag.match(/(?:NAME\s)(.+)/g)[0].substr(5) :
			"default";

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
		let texture_index = 0;

		this.uniforms.forEach(({ name, type, loc, setter, processor }) => {
			if (name in raw_values) {
				let data = raw_values[name];

				if (data === this.raw_values[name]) return;

				if (type === 35678) {
					// texture
					this.values[name] = {
						texture: data.instantiate(this.scene)._,
						index: texture_index++
					};

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
	}

	apply_uniforms(gl, builtins, model, process_extra_shader_components) {
		// TODO if this is the only program, maybe
		// we don't need to re-run this each time
		this.uniforms.forEach(uniform => {
			if (uniform.name in this.values) {
				uniform.setter(gl, uniform.loc, this.values[uniform.name]);
			}
		});

		if (typeof process_extra_shader_components === 'function') {
			process_extra_shader_components(gl, this, model)
		}
	}

	destroy() {
		// TODO
	}
}
