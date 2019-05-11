<script>
	import { writable, derived } from 'svelte/store';
	import { get_scene, get_parent, get_camera } from '../internal/index.mjs';
	import * as vec3 from 'gl-matrix/vec3';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let direction = [0, 0, 0];

	let x = 0;
	let y = 0;

	const { width, height, camera_matrix, view, projection } = get_scene();
	const { ctm } = get_parent();

	let projected = new Float32Array(3);
	let normal = new Float32Array(3);

	$: world_position = vec3.transformMat4(world_position || vec3.create(), location, $ctm);
	$: model_view_projection = mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), $projection, $view), $ctm);
	$: projected = vec3.transformMat4(projected, location, model_view_projection);

	$: {
		// TODO there must be an easier way to do this. Brain fail
		const a_model = location;
		const b_model = [location[0] + direction[0], location[1] + direction[1], location[2] + direction[2]];

		const a_world = world_position;
		const b_world = vec3.transformMat4(normal, b_model, $ctm);

		const a_view = vec3.transformMat4(vec3.create(), a_world, $view);
		const b_view = vec3.transformMat4(vec3.create(), b_world, $view);

		normal[0] = b_view[0] - a_view[0];
		normal[1] = b_view[1] - a_view[1];
		normal[2] = b_view[2] - a_view[2];

		const mag = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);

		normal[0] /= mag;
		normal[1] /= mag;
		normal[2] /= mag;
	}

	$: x = $width * (projected[0] + 1) / 2;
	$: y = $height * (1 - (projected[1] + 1) / 2);
</script>

<style>
	.overlay {
		position: absolute;
		left: 0;
		top: 0;
	}
</style>

<span class="overlay" style="transform: translate({x}px, {y}px)">
	<slot foo={42} normal={normal}></slot>
</span>