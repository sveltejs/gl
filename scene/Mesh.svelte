<script>
	import { writable, derived } from 'svelte/store';
	import { get_scene, get_parent, set_parent } from '../internal.mjs';
	import Material from '../abstract/Material.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0];
	export let scale = 1;
	export let geometry;
	export let material = new Material({/*TODO*/});

	const scene = get_scene();
	const parent = get_parent();

	// TODO make it possible to set a quaternion as a prop?
	// TODO use rotors? http://marctenbosch.com/quaternions/
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

	scene.add(() => ({
		matrix_world: $ctm,
		geometry,
		material
	}));
</script>