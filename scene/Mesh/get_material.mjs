import vert_builtin from './shaders/builtin/vert.glsl';
import frag_builtin from './shaders/builtin/frag.glsl';
import vert_default from './shaders/default/vert.glsl';
import frag_default from './shaders/default/frag.glsl';
import { create_program, get_uniforms, get_attributes } from './program.mjs';
import { process_color } from '../../internal/utils.mjs';

const caches = new Map();

const methods = {
	[5126]: 'uniform1f',
	[35664]: 'uniform2fv',
	[35665]: 'uniform3fv',
	[35666]: 'uniform4fv',

	// [35678]: 'texImage2D'
};

const processors = {
	[35665]: process_color,
	default: x => x
};

export default function get_material(gl, vert, frag, props) {
	if (!caches.has(gl)) caches.set(gl, new Map());
	const cache = caches.get(gl);

	const defines = get_defines(props);
	const hash = defines + vert + frag;

	if (!cache.has(hash)) {
		cache.set(hash, new Material(gl, defines, vert, frag));
	}

	return cache.get(hash);
}

function get_defines(props) {
	const defines = [
		'#define NUM_LIGHTS 2\n' // TODO make this configurable
	];

	for (const k in props) {
		if (k.startsWith('u-') && props[k] != null) {
			defines.push(`#define has_${k.slice(2)} true\n`);
		}
	}
	return defines.join('');
}

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

class Material {
	constructor(gl, defines, vert = vert_default, frag = frag_default) {
		this.gl = gl;

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
	}

	set_uniforms(gl, props) {
		this.uniforms.forEach(uniform => {
			if (uniform.u in props) {
				const processor = processors[uniform.type] || processors.default;
				const data = processor(props[uniform.u]);

				const method = methods[uniform.type];
				if (!method) {
					console.log(uniform.name, data, uniform);
					throw new Error(`not implemented ${uniform.type}`);
				}

				gl[method](this.uniform_locations[uniform.name], data);
			}
		});
	}

	use() {
		this.gl.useProgram(this.program);
	}
}