<script>
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { get_scene, get_layer, get_parent } from '../internal/index.mjs';
	import { process_color } from '../internal/utils.mjs';
	import Material from '../abstract/Material/index.mjs';
	import { remove_program } from '../abstract/Material/program.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0]; // TODO make it possible to set a quaternion as a prop?
	export let scale = 1;
	export let geometry;

	export let material = undefined;
	export let color = [Math.random(), Math.random(), Math.random()];
	export let map = undefined;
	export let specMap = undefined;
	export let bumpMap = undefined;
	export let bumpScale = undefined;
	export let normalMap = undefined;
	export let alpha = 1;
	export let specularity = undefined;
	export let depthTest = true;
	export let vert = undefined;
	export let frag = undefined;
	export let blend = undefined;

	// internal
	let _material = material || new Material({ vert, frag, blend });

	// TODO why tf does this run multiple times?
	// $: console.log('>>>!!material', !!material)

	$: if (!material) _material.color = process_color(color);
	$: if (!material) _material.alpha = alpha;
	$: if (!material) _material.specularity = specularity;
	$: if (!material) _material.depthTest = depthTest;
	$: if (!material) _material.bumpScale = bumpScale;
	$: if (!material && map) load_texture('map', map);
	$: if (!material && specMap) load_texture('specMap', specMap);
	$: if (!material && bumpMap) load_texture('bumpMap', bumpMap);
	$: if (!material && normalMap) load_texture('normalMap', normalMap);

	// TODO put this logic inside the material class?
	function load_texture(id, src) {
		scene.load_image(src).then(bitmap => {
			_material.set_image(id, bitmap);
			update_program(_material);
			scene.invalidate();
		});
	}

	const scene = get_scene();
	const layer = get_layer();
	const parent = get_parent();

	const { ctm } = parent;

	const out = mat4.create();
	const out2 = mat4.create();

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;

	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	$: model = mat4.multiply(model || mat4.create(), $ctm, matrix);
	$: (geometry, material, _material, model, scene.invalidate());

	const mesh = {};
	$: mesh.model = model; // TODO do we need to use a store here?
	$: mesh.model_inverse_transpose = (
		mat4.invert(out2, model),
		mat4.transpose(out2, out2)
	);
	$: mesh.geometry = geometry;

	// TODO take this back out of update_program, pending https://github.com/sveltejs/svelte/issues/2768
	// $: mesh.material = _material;

	let previous_program_info;
	function update_program(material) {
		mesh.material = material;
		const info = material._compile(scene.gl);

		if (info !== previous_program_info) {
			mesh.program_info = info;
			geometry._init(scene.gl, info.program, material); // TODO do we need to tear down anything?

			if (previous_program_info) remove_program(previous_program_info);
			previous_program_info = mesh.program_info;
		}
	}

	$: _material.oninvalid(update_program);

	onDestroy(() => {
		remove_program(mesh.program_info);
	});

	layer.add_mesh(mesh);
</script>