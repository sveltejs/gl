<script>
	import { get_scene } from '../../internal.mjs';

	export let color = [1, 1, 1, 0.2];

	const scene = get_scene();

	scene.add_ambient_light(() => ({
		color // TODO support arrays or numbers
	}));

	$: (color, scene.invalidate());
</script>