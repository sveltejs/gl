<script>
	import { onDestroy, beforeUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	import { get_scene, get_layer, get_parent } from '../../internal/index.mjs';
	import { process_color } from '../../internal/utils.mjs';
	import Material from './Material.mjs';
	import vert_default from './shaders/default/vert.glsl';
	import frag_default from './shaders/default/frag.glsl';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0]; // TODO make it possible to set a quaternion as a prop?
	export let scale = 1;

	export let geometry;

	export let vert = vert_default;
	export let frag = frag_default;
	export let uniforms = {};
	export let blend = undefined;
	export let depthTest = undefined;
	export let transparent = false;

	const scene = get_scene();
	const layer = get_layer();
	const { ctm } = get_parent();

	const out = mat4.create();
	const out2 = mat4.create();

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;
	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	$: model = mat4.multiply(model || mat4.create(), $ctm, matrix);

	$: defines = Object.keys(uniforms)
		.filter(k => uniforms[k] != null)
		.map(k => `#define has_${k} true\n`)
		.join('');
	$: material_instance = new Material(scene, vert, frag, defines, blend, depthTest);
	$: material_instance.set_uniforms(uniforms);
	$: geometry_instance = geometry.instantiate(scene.gl, material_instance.program);

	const mesh = {};
	$: mesh.model = model;
	$: mesh.model_inverse_transpose = (mat4.invert(out2, model), mat4.transpose(out2, out2));
	$: mesh.material = material_instance;
	$: mesh.geometry = geometry_instance;
	$: mesh.transparent = transparent;

	let existing = true; // track if we've previously added this mesh
	const add_mesh = () => {
		layer.add_mesh(mesh, existing);
		existing = false;
	};

	$: (transparent, add_mesh());
	$: (model, transparent && (layer.needs_transparency_sort = true));
	$: (geometry_instance, model, uniforms, scene.invalidate());

	onDestroy(() => {
		if (mesh.material) mesh.material.destroy();
	});
</script>