<script>
	import { onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { get_scene, get_parent, set_parent } from '../internal.mjs';
	import Material from '../abstract/Material.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0];
	export let scale = 1;
	export let geometry;

	export let material = new Material({
		uniforms: {
			color: [Math.random(), Math.random(), Math.random(), 1]
		}
	});

	const scene = get_scene();
	const parent = get_parent();

	// TODO make it possible to set a quaternion as a prop?
	const out = mat4.create();

	const matrix = writable(null);
	const ctm = derived([parent.ctm, matrix], ([$ctm, $matrix]) => {
		// TODO reuse `out`, post-https://github.com/sveltejs/svelte/issues/2644
		return $matrix && mat4.multiply(mat4.create(), $ctm, $matrix);
	});

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;

	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: $matrix = mat4.fromRotationTranslationScale(out, quaternion, location, scale_array);
	$: (geometry, material, $ctm, scene.invalidate());

	const mesh = {};
	$: mesh.matrix_world = $ctm;
	$: mesh.geometry = geometry;
	$: mesh.material = material;


	let previous_program;
	function update_program(material) {
		const program = scene.create_program(material);

		if (program !== previous_program) {
			mesh.program = scene.create_program(material);
			geometry.init(scene.gl, mesh.program.program);

			if (previous_program) scene.delete_program(previous_program);
			previous_program = mesh.program;
		}
	}

	$: update_program(material);

	onDestroy(() => {
		scene.delete_program(mesh.program);
	});

	scene.add(mesh);
</script>