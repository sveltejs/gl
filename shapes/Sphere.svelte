<script>
	import Mesh from '../scene/Mesh.svelte';
	import Geometry from '../abstract/Geometry.mjs';
	import Attribute from '../abstract/Attribute.mjs';

	import icosphere from 'icosphere';
	import normals from 'angle-normals';

	export let subdivisions = 1;

	const { positions, cells } = icosphere(subdivisions);

	const position = new Attribute({
		data: new Float32Array(positions.flat()),
		size: 3
	});

	const normal = new Attribute({
		data: new Float32Array(normals(cells, positions).flat()),
		size: 3
	});

	const index = new Uint32Array(cells.flat());

	const geometry = new Geometry({ position, normal }, { index });
</script>

<Mesh {...$$props} {geometry}/>