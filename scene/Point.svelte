<script>
	import { get_scene, get_parent, get_camera } from '../internal/index.mjs';
	import * as vec3 from 'gl-matrix/vec3';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let direction = [0, 0, 0];

	export let x = 0;
	export let y = 0;
	export let vector = new Float32Array(3);

	const { width, height, camera_matrix, view, projection } = get_scene();
	const { ctm } = get_parent();

	let projected = new Float32Array(3);

	$: world_position = vec3.transformMat4(world_position || vec3.create(), location, $ctm);
	$: model_view_projection = mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), $projection, $view), $ctm);
	$: projected = vec3.transformMat4(projected, location, model_view_projection);

	$: {
		// TODO there must be an easier way to do this. Brain fail
		const a_model = location;
		const b_model = [location[0] + direction[0], location[1] + direction[1], location[2] + direction[2]];

		const a_world = world_position;
		const b_world = vec3.transformMat4(vector, b_model, $ctm);

		const a_view = vec3.transformMat4(vec3.create(), a_world, $view);
		const b_view = vec3.transformMat4(vec3.create(), b_world, $view);

		vector[0] = b_view[0] - a_view[0];
		vector[1] = b_view[1] - a_view[1];
		vector[2] = b_view[2] - a_view[2];

		const mag = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);

		vector[0] /= mag;
		vector[1] /= mag;
		vector[2] /= mag;
	}

	$: x = $width * (projected[0] + 1) / 2;
	$: y = $height * (1 - (projected[1] + 1) / 2);
</script>

<slot {x} {y} {vector}></slot>