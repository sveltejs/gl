<script>
	import Mesh from '../scene/Mesh.svelte';
	import Geometry from '../abstract/Geometry.mjs';
	import Attribute from '../abstract/Attribute.mjs';

	const position = new Attribute({
		data: new Float32Array([
			 1,  1, 0,
			-1,  1, 0,
			 1, -1, 0,
			-1, -1, 0,
		]),
		size: 3
	});

	const normal = new Attribute({
		data: new Float32Array([
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		]),
		size: 3
	});

	const uv = new Attribute({
		data: new Float32Array([
			1, 0,
			0, 0,
			1, 1,
			0, 1
		]),
		size: 2
	});

	const index = new Uint32Array([
		0, 1, 2,
		3, 2, 1
	]);

	const geometry = new Geometry({ position, normal, uv }, { index });
</script>

<Mesh {...$$props} {geometry}/>