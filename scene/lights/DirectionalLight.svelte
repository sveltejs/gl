<script>
	import { get_scene, get_parent } from '../../internal/index.mjs';
	import { process_color } from '../../internal/utils.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	export let direction = new Float32Array([-1, -1, -1]);
	export let color = new Float32Array([1, 1, 1]);
	export let intensity = 1;

	const scene = get_scene();
	const { ctm } = get_parent();

	$: multiplied = vec3.transformMat4(multiplied || vec3.create(), direction, $ctm);

	const light = {};
	$: light.direction = vec3.normalize(light.direction || vec3.create(), multiplied); // TODO at some point, direction needs to be reversed
	$: light.color = process_color(color);
	$: light.intensity = intensity;

	scene.add_directional_light(light);

	$: (light, scene.invalidate());
</script>