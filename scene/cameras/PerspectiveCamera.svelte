<script>
	import { get_scene, get_parent } from '../../internal.mjs';
	import * as mat4 from 'gl-matrix/mat4';

	export let location = [0, 0, 0];
	export let target = [0, 0, 0];
	export let up = [0, 1, 0];
	export let fov = 60;
	export let near = 1;
	export let far = 20000;

	const { add_camera, invalidate, width, height } = get_scene();
	const { ctm } = get_parent();

	let camera = mat4.create();
	let view = mat4.create();
	let view_inverse_transpose = mat4.create();

	$: camera = (
		mat4.translate(camera, $ctm, location),
		mat4.targetTo(camera, location, target, up)
	);

	$: view = mat4.invert(view, camera);

	$: view_inverse_transpose = (
		mat4.invert(view_inverse_transpose, view),
		mat4.transpose(view_inverse_transpose, view_inverse_transpose)
	);

	$: projection = mat4.perspective(
		projection || mat4.create(),
		fov / 180 * Math.PI,
		$width / $height,
		near,
		far
	);

	add_camera(() =>{
		return { projection, view, view_inverse_transpose };
	});

	$: (view, projection, invalidate());
</script>