<script>
	import { get_scene } from '../../internal/index.mjs';
	import { process_color } from '../../internal/utils.mjs';

	export let color = [1, 1, 1];
	export let intensity = 0.2;

	const scene = get_scene();

	const light = {};
	$: light.color = process_color(color);
	$: light.intensity = intensity;

	scene.add_ambient_light(light);

	$: (light, scene.invalidate());
</script>