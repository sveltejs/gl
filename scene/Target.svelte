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

	// break `location` out into its components, so that we can
	// skip downstream computations. TODO would be nice if there
	// was a neater way to achieve this
	$: x = location[0];
	$: y = location[1];
	$: z = location[2];

	const loc = new Float32Array(3);
	$: loc[0] = x, loc[1] = y, loc[2] = z;

	$: model = mat4.translate(model, $ctm, loc);
	$: (model, get_target(id).set(world_position));
</script>