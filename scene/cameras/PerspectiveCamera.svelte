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

	let camera_matrix = mat4.create();
	let view = mat4.create();
	let view_inverse_transpose = mat4.create();

	$: camera_matrix = (
		mat4.translate(camera_matrix, $ctm, location),
		mat4.targetTo(camera_matrix, location, target, up)
	);

	// should be a const, pending https://github.com/sveltejs/svelte/issues/2728
	let camera = {};

	$: camera.view = mat4.invert(view, camera_matrix);

	$: camera.view_inverse_transpose = (
		mat4.invert(view_inverse_transpose, view),
		mat4.transpose(view_inverse_transpose, view_inverse_transpose)
	);

	$: camera.projection = mat4.perspective(
		camera.projection || mat4.create(),
		fov / 180 * Math.PI,
		$width / $height,
		near,
		far
	);

	add_camera(camera);

	$: (camera, invalidate());
</script>