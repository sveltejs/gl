<script>
	import { writable } from 'svelte/store';
	import { get_scene, get_parent, set_parent } from '../internal/index.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let lookAt;
	export let up = [0, 1, 0];
	export let rotation = [0, 0, 0]; // TODO make it possible to set a quaternion as a prop?
	export let scale = 1;

	const scene = get_scene();
	const parent = get_parent();

	const { ctm: parent_ctm } = parent;
	const ctm = writable(null);

	let matrix = mat4.create();
	let quaternion = quat.create();
	const world_position = new Float32Array(matrix.buffer, 12 * 4, 3);

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;

	$: target = lookAt ? scene.get_target(lookAt) : writable(null);

	$: if ($target) {
		mat4.translate(matrix, $parent_ctm, location);
		mat4.targetTo(matrix, world_position, $target, up);
		mat4.scale(matrix, matrix, scale_array);

		$ctm = matrix;
	} else {
		quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
		matrix = mat4.fromRotationTranslationScale(matrix, quaternion, location, scale_array);
		$ctm = mat4.multiply($ctm || mat4.create(), $parent_ctm, matrix);
	}

	// $: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	// $: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	// $: $ctm = mat4.multiply($ctm || mat4.create(), $parent_ctm, matrix);
	$: ($ctm, scene.invalidate());

	set_parent({ ctm });
</script>

<slot></slot>