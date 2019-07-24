export function remove_program(info) {
	const cache = caches.get(info.gl);

	if (--info.users === 0) {
		info.gl.deleteProgram(info.program);
		cache.delete(info.hash);
	}
}

function pad(num, len = 4) {
	num = String(num);
	while (num.length < len) num = ` ${num}`;
	return num;
}

function repeat(str, i) {
	let result = '';
	while (i--) result += str;
	return result;
}

function create_shader(gl, type, source, label) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	const log = gl.getShaderInfoLog(shader);
	const match = /ERROR: (\d+):(\d+): (.+)/.exec(log);

	if (match) {
		const c = +match[1];
		const l = +match[2] - 1;

		console.log('%c' + match[3], 'font-weight: bold; color: red');

		const lines = source.split('\n');
		for (let i = 0; i < lines.length; i += 1) {
			if (Math.abs(l - i) > 5) continue;

			const line = lines[i].replace(/^\t+/gm, tabs => repeat(' ', tabs.length * 4));
			const indent = /^\s+/.exec(line);

			const str = `${pad(i)}: ${line}`;

			if (i === l) {
				console.log('%c' + str, 'font-weight: bold; color: red');
				console.log('%c' + (indent && indent[0] || '') + repeat(' ', c + 6) + '^', 'color: red');
			} else {
				console.log(str);
			}
		}

		throw new Error(`Failed to compile ${label} shader`);
	}

	throw new Error(`Failed to compile ${label} shader:\n${log}`);
}

export function create_program(gl, vert, frag) {
	const program = gl.createProgram();

	gl.attachShader(program, create_shader(gl, gl.VERTEX_SHADER, vert, 'vertex'));
	gl.attachShader(program, create_shader(gl, gl.FRAGMENT_SHADER, frag, 'fragment'));
	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		console.log(gl.getProgramInfoLog(program));
		throw new Error(`Failed to compile program:\n${gl.getProgramInfoLog(program)}`);
	}

	return program;
}

export function get_uniforms(gl, program) {
	const uniforms = [];

	const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	for (let i = 0; i < n; i += 1) {
		let { size, type, name } = gl.getActiveUniform(program, i);
		const loc = gl.getUniformLocation(program, name);

		uniforms.push({ size, type, name, u: `u-${name}`, loc });
	}

	return uniforms;
}

export function get_attributes(gl, program) {
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