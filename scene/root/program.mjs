import vert_builtin from '../../shaders/builtin/vert.glsl.mjs';
import frag_builtin from '../../shaders/builtin/frag.glsl.mjs';

// TODO remove this, have it be on the material
import vert_default from '../../shaders/default/vert.glsl.mjs';
import frag_default from '../../shaders/default/frag.glsl.mjs';

const caches = new Map();

export function get_or_create_program(gl, material) {
	if (!caches.get(gl)) caches.set(gl, new Map());
	const cache = caches.get(gl);

	if (!cache.has(material.hash)) {
		const vert = vert_builtin + (material.vert || vert_default);
		const frag = frag_builtin + (material.frag || frag_default);

		const program = create_program(gl, vert, frag);
		const uniforms = get_uniforms(gl, program);
		const attributes = get_attributes(gl, program);

		const uniform_locations = {};
		uniforms.forEach(uniform => {
			uniform_locations[uniform.name] = gl.getUniformLocation(program, uniform.name);
		});

		const attribute_locations = {};
		attributes.forEach(attribute => {
			attribute_locations[attribute.name] = gl.getAttribLocation(program, attribute.name);
		});

		cache.set(material.hash, {
			program,
			uniforms,
			attributes,
			uniform_locations,
			attribute_locations
		});
	}

	return cache.get(material.hash);
}

function create_shader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	throw new Error(`Failed to compile shader:\n${gl.getShaderInfoLog(shader)}`);
}

function create_program(gl, vert, frag) {
	const program = gl.createProgram();

	gl.attachShader(program, create_shader(gl, gl.VERTEX_SHADER, vert));
	gl.attachShader(program, create_shader(gl, gl.FRAGMENT_SHADER, frag));
	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		throw new Error(`Failed to compile shader:\n${gl.getProgramInfoLog(program)}`);
	}

	return program;
}

function get_uniforms(gl, program) {
	const uniforms = [];

	const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	for (let i = 0; i < n; i += 1) {
		let { size, type, name } = gl.getActiveUniform(program, i);
		name = name.replace('[0]', '');
		const loc = gl.getUniformLocation(program, name);

		uniforms.push({ size, type, name, loc });
	}

	return uniforms;
}

function get_attributes(gl, program) {
	const attributes = [];

	const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

	for (let i = 0; i < n; i += 1) {
		let { size, type, name } = gl.getActiveAttrib(program, i);
		name = name.replace('[0]', '');
		const loc = gl.getAttribLocation(program, name);

		attributes.push({ size, type, name, loc });
	}

	return attributes;
}