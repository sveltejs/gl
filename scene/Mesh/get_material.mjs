class Material {
	constructor(scene, vert, frag) {
		this.gl = scene.gl;
	}

	use() {
		this.gl.useProgram(this.program);
	}
}

export default function get_material(scene, vert, frag) {

}