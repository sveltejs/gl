<script>
	import { writable } from 'svelte/store';
	import { get_scene, get_parent } from '../internal/index.mjs';
	import * as mat4 from 'gl-matrix/mat4';

	export let id;
	export let location = [0, 0, 0];

	const { get_target } = get_scene();
	const { ctm } = get_parent();

	let model = mat4.create();
	const world_position = new Float32Array(model.buffer, 12 * 4, 3);

	$: model = mat4.translate(model, $ctm, location);
	$: (model, get_target(id).set(world_position));
</script>