import vert_builtin from './shaders/builtin/vert.glsl';
import frag_builtin from './shaders/builtin/frag.glsl';

const caches = new Map();

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

export function get_program(gl, material) {
	if (!caches.get(gl)) caches.set(gl, new Map());
	const cache = caches.get(gl);

	if (!cache.has(material.hash)) {
		const defines = [
			`NUM_LIGHTS 2`, // TODO make this parameterisable
			(material._textures.map || material._textures.specMap || material._textures.bumpMap || material._textures.normalMap) && `USES_TEXTURES true`,
			material._textures.map && `USES_COLOR_MAP true`,
			material._textures.specMap && `USES_SPEC_MAP true`,
			material._textures.bumpMap && `USES_BUMP_MAP true`,
			material._textures.normalMap && `USES_NORMAL_MAP true`,
			material.alpha < 1 && `USES_ALPHA true`
		].filter(Boolean).map(x => `#define ${x}`).join('\n') + '\n\n';

		console.log(defines);

		const vert = defines + vert_builtin + '\n\n' + material.vert;
		const frag = defines + frag_builtin + '\n\n' + material.frag;

		const program = create_program(gl, vert, frag);
		const uniforms = get_uniforms(gl, program);
		const attributes = get_attributes(gl, program);

		const uniform_locations = {};
		uniforms.forEach(uniform => {
			deep_set(uniform_locations, uniform.name, gl.getUniformLocation(program, uniform.name));
		});

		const attribute_locations = {};
		attributes.forEach(attribute => {
			attribute_locations[attribute.name] = gl.getAttribLocation(program, attribute.name);
		});

		cache.set(material.hash, {
			users: 0,
			hash: material.hash,
			gl,
			program,
			uniforms,
			attributes,
			uniform_locations,
			attribute_locations
		});
	}

	const info = cache.get(material.hash);
	info.users += 1;

	return info;
}

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
				console.log('%c' + indent + repeat(' ', c + 6) + '^', 'color: red');
			} else {
				console.log(str);
			}
		}

		throw new Error(`Failed to compile ${label} shader`);
	}

	throw new Error(`Failed to compile ${label} shader:\n${log}`);
}

function create_program(gl, vert, frag) {
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

function get_uniforms(gl, program) {
	const uniforms = [];

	const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	for (let i = 0; i < n; i += 1) {
		let { size, type, name } = gl.getActiveUniform(program, i);
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