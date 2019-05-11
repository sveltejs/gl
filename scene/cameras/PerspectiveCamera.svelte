<script>
	import { get_scene, get_parent } from '../../internal/index.mjs';
	import * as mat4 from 'gl-matrix/mat4';

	export let location = [0, 0, 0];
	export let target = [0, 0, 0];
	export let up = [0, 1, 0];
	export let fov = 60;
	export let near = 1;
	export let far = 20000;

	const { add_camera, invalidate, width, height } = get_scene();
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

	$: camera.matrix = (
		mat4.translate(camera.matrix, $ctm, location),
		mat4.targetTo(camera.matrix, location, target, up)
	);

	$: camera.view = mat4.invert(camera.view, camera.matrix);

	$: camera.projection = mat4.perspective(
		camera.projection,
		fov / 180 * Math.PI,
		$width / $height,
		near,
		far
	);

	$: (camera, invalidate());

	add_camera(camera);
</script>