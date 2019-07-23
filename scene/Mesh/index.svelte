<script context="module">
	const geometry_instances = new Map();

	function instantiate_geometry(scene, geometry) {

	}
</script>

<script>
	import { onDestroy, beforeUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	import { get_scene, get_layer, get_parent } from '../../internal/index.mjs';
	import { process_color } from '../../internal/utils.mjs';
	import Material from '../../abstract/Material/index.mjs';
	import { remove_program } from '../../abstract/Material/program.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0]; // TODO make it possible to set a quaternion as a prop?
	export let scale = 1;

	export let geometry;

	export let vert;
	export let frag;
	export let blend;
	export let depthTest;

	const scene = get_scene();
	const layer = get_layer();
	const { ctm } = get_parent();

	const out = mat4.create();
	const out2 = mat4.create();

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;
	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	$: model = mat4.multiply(model || mat4.create(), $ctm, matrix);

	let material;
	$: {
		if (material) material.destroy();
		material = get_material(scene, vert, frag);
	}

	const mesh = {};
	$: mesh.model = model;
	$: mesh.model_inverse_transpose = (
		mat4.invert(out2, model),
		mat4.transpose(out2, out2)
	);
	$: mesh.material = material;
	$: mesh.geometry = geometry.instantiate(scene, material);

	beforeUpdate(scene.invalidate);

	onDestroy(() => {
		if (mesh.material) mesh.material.destroy();
	});

	layer.add_mesh(mesh);
</script>