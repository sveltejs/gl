<script context="module">
	import Mesh from '../scene/Mesh.svelte';
	import Geometry from '../abstract/Geometry.mjs';
	import Attribute from '../abstract/Attribute.mjs';

	let pos = 0.5;
	let neg = -0.5;

	const position = new Attribute({
		data: new Float32Array([
			// front
			pos, pos, pos,
			neg, pos, pos,
			pos, neg, pos,
			neg, neg, pos,

			// left
			neg, pos, pos,
			neg, pos, neg,
			neg, neg, pos,
			neg, neg, neg,

			// back
			neg, pos, neg,
			pos, pos, neg,
			neg, neg, neg,
			pos, neg, neg,

			// right
			pos, pos, neg,
			pos, pos, pos,
			pos, neg, neg,
			pos, neg, pos,

			// top
			neg, pos, neg,
			neg, pos, pos,
			pos, pos, neg,
			pos, pos, pos,

			// bottom
			neg, neg, pos,
			neg, neg, neg,
			pos, neg, pos,
			pos, neg, neg
		]),
		size: 3
	});

	const normal = new Attribute({
		data: new Float32Array([
			// front
			 0, 0, 1,
			 0, 0, 1,
			 0, 0, 1,
			 0, 0, 1,

			// left
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,

			// back
			 0, 0, -1,
			 0, 0, -1,
			 0, 0, -1,
			 0, 0, -1,

			// right
			 1, 0, 0,
			 1, 0, 0,
			 1, 0, 0,
			 1, 0, 0,

			// top
			 0, 1, 0,
			 0, 1, 0,
			 0, 1, 0,
			 0, 1, 0,

			// bottom
			 0, -1, 0,
			 0, -1, 0,
			 0, -1, 0,
			 0, -1, 0
		]),
		size: 3
	});

	const index = new Uint32Array([
		// front
		0, 1, 2,
		3, 2, 1,

		// left
		4, 5, 6,
		7, 6, 5,

		// back
		8, 9, 10,
		11, 10, 9,

		// right
		12, 13, 14,
		15, 14, 13,

		// top
		16, 17, 18,
		19, 18, 17,

		// bottom
		20, 21, 22,
		23, 22, 21
	]);

	const geometry = new Geometry({ position, normal }, { index });
</script>

<Mesh {...$$props} {geometry}/>