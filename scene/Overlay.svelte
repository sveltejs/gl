<script>
	import { writable, derived } from 'svelte/store';
	import { get_scene, get_parent, get_camera } from '../internal/index.mjs';
	import * as vec3 from 'gl-matrix/vec3';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0];
	export let scale = 1;

	let x = 0;
	let y = 0;

	const { width, height, view, projection } = get_scene();
	const { ctm } = get_parent();

	// TODO make it possible to set a quaternion as a prop?
	let matrix = mat4.create();
	let model = mat4.create();
	let mvp = mat4.create();
	let position = vec3.create();
	let normal = vec3.create();

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;

	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix, quaternion, location, scale_array);
	$: model = mat4.multiply(mat4.create(), $ctm, matrix);

	$: if ($projection && $view) mvp = mat4.multiply(mvp, $projection, mat4.multiply(mvp, $view, model));
	$: if (mvp) position = vec3.transformMat4(position, [0, 0, 0], mvp);

	// $: console.log(rotation, $model_inverse_transpose);
	// $: if ($model_inverse_transpose) normal = vec3.normalize(normal, vec3.transformMat4(normal, rotation, $model_inverse_transpose));

	$: x = position && $width * (position[0] + 1) / 2;
	$: y = position && $height * (1 - (position[1] + 1) / 2);
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