export function process_color(color) {
	if (typeof color === 'number') {
		const r = (color & 0xff0000) >> 16;
		const g = (color & 0x00ff00) >> 8;
		const b = (color & 0x0000ff);

		return new Float32Array([
			r / 255,
			g / 255,
			b / 255
		]);
	}

	return color;
}

export function normalize(out, vector = out) {
	let total = 0;
	for (let i = 0; i < vector.length; i += 1) {
		total += vector[i] * vector[i];
	}

	const mag = Math.sqrt(total);

	out[0] = vector[0] / mag;
	out[1] = vector[1] / mag;
	out[2] = vector[2] / mag;

	return out;
}

export function create_worker(url, fn) {
	const worker = new Worker(url);
	const code = fn.toString().replace(/^(function.+?|.+=>\s*)\{/g, '').slice(0, -1);

	worker.postMessage(code);

	return worker;
}