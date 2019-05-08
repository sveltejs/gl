export default class Material {
	constructor(opts) {
		Object.assign(this, opts);

		// TODO make this real — https://github.com/mrdoob/three.js/blob/f186b20983e07564d62fb0c067726931c28d92f6/src/renderers/webgl/WebGLPrograms.js#L218
		this.hash = Math.random().toString(36).slice(2);
	}
}