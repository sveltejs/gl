export function process_color(color) {
	if (typeof color === 'number') {
		let r = (color & 0xff000000) >> 24;
		if (r < 0) r += 256;

		const g = (color & 0x00ff0000) >> 16;
		const b = (color & 0x0000ff00) >> 8;
		const a = (color & 0x000000ff);

		return new Float32Array([
			r / 255,
			g / 255,
			b / 255,
			a / 255
		]);
	}

	return color;
}