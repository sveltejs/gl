<script context="module">
	function compute_flat_geometry(radius, height, sides) {
		const num_vertices = sides * 3;

		const position_data = new Float32Array(num_vertices * 3 * 2);
		const normal_data = new Float32Array(num_vertices * 3 * 2);

		const ny = radius / height;

		for (let i = 0; i < sides; i += 1) {
			const start_angle = (i / sides) * Math.PI * 2;
			const end_angle = ((i + 1) / sides) * Math.PI * 2;
			const half_angle = (start_angle + end_angle) / 2;

			let o = i * 3 * 3 * 2;

			const x1 = Math.sin(start_angle) * radius;
			const z1 = Math.cos(start_angle) * radius;
			const x2 = Math.sin(end_angle) * radius;
			const z2 = Math.cos(end_angle) * radius;

			// top face
			position_data[o + 0] = x1;
			position_data[o + 1] = 0;
			position_data[o + 2] = z1;

			position_data[o + 3] = x2;
			position_data[o + 4] = 0;
			position_data[o + 5] = z2;

			position_data[o + 6] = 0;
			position_data[o + 7] = height;
			position_data[o + 8] = 0;

			const nx = Math.sin(half_angle);
			const nz = Math.cos(half_angle);

			const mag = Math.sqrt(nx * nx + ny * ny + nz * nz);

			const nnx = nx / mag;
			const nny = ny / mag;
			const nnz = nz / mag;

			normal_data[o + 0] = normal_data[o + 3] = normal_data[o + 6] = nnx;
			normal_data[o + 1] = normal_data[o + 4] = normal_data[o + 7] = nny;
			normal_data[o + 2] = normal_data[o + 5] = normal_data[o + 8] = nnz;

			o += 9;

			// bottom face
			position_data[o + 0] = x2;
			position_data[o + 1] = 0;
			position_data[o + 2] = z2;

			position_data[o + 3] = x1;
			position_data[o + 4] = 0;
			position_data[o + 5] = z1;

			position_data[o + 6] = 0;
			position_data[o + 7] = 0;
			position_data[o + 8] = 0;

			normal_data[o + 0] = normal_data[o + 3] = normal_data[o + 6] = 0;
			normal_data[o + 1] = normal_data[o + 4] = normal_data[o + 7] = -1;
			normal_data[o + 2] = normal_data[o + 5] = normal_data[o + 8] = 0;
		}

		return new Geometry({
			position: new Attribute({
				data: position_data,
				size: 3
			}),

			normal: new Attribute({
				data: normal_data,
				size: 3
			})
		});
	}

	function compute_smooth_geometry(radius, height, sides) {
		throw new Error('TODO');
	}
</script>

<script>
	import Mesh from '../scene/Mesh/index.svelte';
	import Geometry from '../abstract/Geometry.mjs';
	import Attribute from '../abstract/Attribute.mjs';

	export let radius = 1;
	export let height = 1;
	export let sides = 12;
	export let shading = 'flat';

	$: geometry = shading === 'flat'
		? compute_flat_geometry(radius, height, sides)
		: compute_smooth_geometry(radius, height, sides);
</script>

<Mesh {...$$props} {geometry}/>