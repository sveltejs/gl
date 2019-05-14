<script>
	import { onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { get_scene, get_layer, get_parent } from '../internal/index.mjs';
	import { process_color } from '../internal/utils.mjs';
	import Material from '../abstract/Material/index.mjs';
	import { remove_program } from '../abstract/Material/program.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0];
	export let scale = 1;
	export let geometry;

	export let material;
	export let color = [Math.random(), Math.random(), Math.random()];
	export let map = undefined;
	export let alpha = 1;

	// internal
	let _map;
	let _material;

	$: if (typeof map === 'string') {
		const img = new Image();
		img.onload = () => {
			_map = img;
		}
		img.src = map;
	}

	$: _material = material || new Material({
		color: process_color(color), // TODO process color in the material itself?
		alpha,
		map: _map
	});

	const scene = get_scene();
	const layer = get_layer();
	const parent = get_parent();

	// TODO make it possible to set a quaternion as a prop?
	const out = mat4.create();
	const out2 = mat4.create();

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
	$: mesh.model = $ctm; // TODO do we need to use a store here?
	$: mesh.model_inverse_transpose = (
		mat4.invert(out2, $ctm),
		mat4.transpose(out2, out2)
	);
	$: mesh.geometry = geometry;
	$: mesh.material = _material;


	let previous_program_info;
	function update_program(material) {
		const info = material._compile(scene.gl);

		if (info !== previous_program_info) {
			mesh.program_info = info;
			geometry.init(scene.gl, info.program); // TODO do we need to tear down anything?

			if (previous_program_info) remove_program(previous_program_info);
			previous_program_info = mesh.program_info;
		}
	}

	$: update_program(_material);

	onDestroy(() => {
		remove_program(mesh.program_info);
	});

	layer.add_mesh(mesh);
</script>