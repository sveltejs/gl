<script>
	import { get_renderer, get_parent } from '../../internal.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	export let direction = [-1, -1, -1];
	export let color = [1, 1, 1, 1];

	const renderer = get_renderer();
	const { ctm } = get_parent();

	$: multiplied = vec3.transformMat4(multiplied || vec3.create(), direction, $ctm);
	$: normalized = vec3.normalize(normalized || vec3.create(), multiplied);

	renderer.add_directional_light(() => {
		return {
			direction: normalized,
			color // TODO support arrays or numbers
		};
	});

	$: (normalized, color, renderer.invalidate());
</script>