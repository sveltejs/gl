<script>
	import { onDestroy, beforeUpdate } from 'svelte';
	import { writable } from 'svelte/store';
	import { get_scene, get_layer, get_parent } from '../../internal/index.mjs';
	import { process_color } from '../../internal/utils.mjs';
	import Material from './Material.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0]; // TODO make it possible to set a quaternion as a prop?
	export let scale = 1;

	export let geometry;

	export let vert = undefined;
	export let frag = undefined;
	export let blend = undefined;
	export let depthTest = undefined;

	const scene = get_scene();
	const layer = get_layer();
	const { ctm } = get_parent();

	const out = mat4.create();
	const out2 = mat4.create();

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;
	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	$: model = mat4.multiply(model || mat4.create(), $ctm, matrix);

	const mesh = {};
	$: mesh.model = model;
	$: mesh.model_inverse_transpose = (mat4.invert(out2, model), mat4.transpose(out2, out2));

	let old_material;
	let old_program;
	let old_uniforms = {};
	let old_hash;

	beforeUpdate(() => {
		const uniforms = {};
		let dirty_uniforms = false;

		let defines = '#define NUM_LIGHTS 2\n'; // TODO make this configurable

		for (const k in $$props) {
			const v = $$props[k];
			if (k.startsWith('u-') && v != null) {
				const n = k.slice(2);
				defines += `#define has_${n} true\n`;
				uniforms[n] = v;

				if (v !== old_uniforms[n]) {
					dirty_uniforms = true;
				}
			}
		}

		const hash = defines + vert + frag;

		if (old_hash !== (old_hash = hash)) {
			mesh.material = new Material(scene, defines, vert, frag);
			mesh.geometry = geometry.instantiate(scene.gl, mesh.material.program);

			if (old_material) old_material.destroy();
			old_material = mesh.material;
		}

		if (dirty_uniforms) {
			mesh.material.set_uniforms(uniforms);
		}

		scene.invalidate();

		old_uniforms = uniforms;
	});

	onDestroy(() => {
		if (mesh.material) mesh.material.destroy();
	});

	layer.add_mesh(mesh);
</script>