<script>
	import { get_scene, get_parent } from '../../internal/index.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	export let location = [-1, -1, -1];
	export let color = [1, 1, 1, 1];

	const scene = get_scene();
	const { ctm } = get_parent();

	$: multiplied = vec3.transformMat4(multiplied || vec3.create(), location, $ctm);

	scene.add_point_light(() => {
		return {
			location: multiplied,
			color // TODO support arrays or numbers
		};
	});

	$: (multiplied, color, scene.invalidate());
</script>