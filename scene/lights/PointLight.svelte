<script>
	import { get_scene, get_parent } from '../../internal/index.mjs';
	import { process_color } from '../../internal/utils.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	export let location = new Float32Array([-1, -1, -1]);
	export let color = new Float32Array([1, 1, 1]);
	export let intensity = 1;

	const scene = get_scene();
	const { ctm } = get_parent();

	let light = { // TODO change to a const once bug is fixed
		location: vec3.create(),
		color: null,
		intensity: null
	};

	$: light.location = vec3.transformMat4(light.location, location, $ctm);
	$: light.color = process_color(color);
	$: light.intensity = intensity;

	scene.add_point_light(light);

	$: (light, scene.invalidate());
</script>