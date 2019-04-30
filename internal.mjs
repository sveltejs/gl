import { getContext, setContext } from 'svelte';

export const RENDERER = {};
export const PARENT = {};

export function get_renderer() {
	return getContext(RENDERER);
}

export function get_parent() {
	return getContext(PARENT);
}

export function set_parent(parent) {
	return setContext(PARENT, parent);
}

export function create_shader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	throw new Error(`Failed to compile shader:\n${gl.getShaderInfoLog(shader)}`);
}

export function create_program(gl, { vert, frag }) {
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