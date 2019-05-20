<script>
	import { writable } from 'svelte/store';
	import { get_scene, get_parent, set_parent } from '../internal/index.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as quat from 'gl-matrix/quat';

	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0]; // TODO make it possible to set a quaternion as a prop?
	export let scale = 1;

	const scene = get_scene();
	const parent = get_parent();

	const { ctm: parent_ctm } = parent;
	const ctm = writable(null);

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;

	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	$: $ctm = mat4.multiply($ctm || mat4.create(), $parent_ctm, matrix);
	$: ($ctm, scene.invalidate());

	set_parent({ ctm });
</script>

<slot></slot>