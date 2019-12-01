<script>
	import { writable } from 'svelte/store';
	import { get_scene, get_parent } from '../../internal/index.mjs';
	import * as mat4 from 'gl-matrix/mat4';

	export let location = [0, 0, 0];
	export let lookAt = null;
	export let up = [0, 1, 0];
	export let fov = 60;
	export let near = 1;
	export let far = 20000;

	const { add_camera, update_camera, width, height, get_target } = get_scene();
	const { ctm } = get_parent();

	const matrix = mat4.create();
	const world_position = new Float32Array(matrix.buffer, 12 * 4, 3);

	// should be a const, pending https://github.com/sveltejs/svelte/issues/2728
	let camera = {
		matrix,
		world_position,
		view: mat4.create(),
		projection: mat4.create()
	};

	let target = writable(null);

	$: if (typeof lookAt === 'string') {
		target = get_target(lookAt);
	} else {
		target.set(lookAt);
	}

	$: camera.matrix = (
		mat4.translate(camera.matrix, $ctm, location),
		$target && mat4.targetTo(camera.matrix, world_position, $target, up),
		camera.matrix
	);

	$: camera.view = mat4.invert(camera.view, camera.matrix);

	$: camera.projection = mat4.perspective(
		camera.projection,
		fov / 180 * Math.PI,
		$width / $height,
		near,
		far
	);

	$: update_camera(camera);

	add_camera(camera);
</script>