<script context="module">
	import Geometry from '../abstract/Geometry.mjs';
	import Attribute from '../abstract/Attribute.mjs';
	import { normalize } from '../internal/utils.mjs';

	const p = 0.85065080835204;
	const q = 0.5257311121191336;

	const position = new Float32Array([
		-q, +p,  0,
		+q, +p,  0,
		-q, -p,  0,
		+q, -p,  0,
		 0, -q, +p,
		 0, +q, +p,
		 0, -q, -p,
		 0, +q, -p,
		+p,  0, -q,
		+p,  0, +q,
		-p,  0, -q,
		-p,  0, +q
	]);

	const index = new Uint16Array([
		0, 11, 5,
		0, 5, 1,
		0, 1, 7,
		0, 7, 10,
		0, 10, 11,
		1, 5, 9,
		5, 11, 4,
		11, 10, 2,
		10, 7, 6,
		7, 1, 8,
		3, 9, 4,
		3, 4, 2,
		3, 2, 6,
		3, 6, 8,
		3, 8, 9,
		4, 9, 5,
		2, 4, 11,
		6, 2, 10,
		8, 6, 7,
		9, 8, 1
	]);

	function compute_flat_geometry(subdivisions) {
		throw new Error(`TODO implement flat sphere geometry`);
	}

	const smooth_geometry = [
		new Geometry({
			position: new Attribute({ data: position, size: 3 }),
			normal: new Attribute({ data: position, size: 3 })
		}, { index })
	];

	function subdivide(geometry) {
		const index = new Uint32Array(geometry.index.length * 4);

		const old_position = geometry.attributes.position.data;
		const new_positions = [];
		const lookup = new Map();

		function get_index(point) {
			const hash = `${point[0].toPrecision(6)},${point[1].toPrecision(6)},${point[2].toPrecision(6)}`;

			if (lookup.has(hash)) {
				return lookup.get(hash);
			}

			const index = new_positions.length;
			lookup.set(hash, index);
			new_positions[index] = point;
			return index;
		}

		function mid(a, b) {
			return get_index([
				(a[0] + b[0]) / 2,
				(a[1] + b[1]) / 2,
				(a[2] + b[2]) / 2
			]);
		}

		for (let i = 0; i < geometry.index.length; i += 3) {
			const c0 = geometry.index[i + 0];
			const c1 = geometry.index[i + 1];
			const c2 = geometry.index[i + 2];

			const v0 = [
				old_position[c0 * 3 + 0],
				old_position[c0 * 3 + 1],
				old_position[c0 * 3 + 2]
			];

			const v1 = [
				old_position[c1 * 3 + 0],
				old_position[c1 * 3 + 1],
				old_position[c1 * 3 + 2]
			];

			const v2 = [
				old_position[c2 * 3 + 0],
				old_position[c2 * 3 + 1],
				old_position[c2 * 3 + 2]
			];

			const a = mid(v0, v1);
			const b = mid(v1, v2);
			const c = mid(v2, v0);

			// four new faces
			const j = i * 4;

			index[j + 0] = get_index(v0);
			index[j + 1] = a;
			index[j + 2] = c;

			index[j + 3] = get_index(v1);
			index[j + 4] = b;
			index[j + 5] = a;

			index[j + 6] = get_index(v2);
			index[j + 7] = c;
			index[j + 8] = b;

			index[j + 9] = a
			index[j + 10] = b;
			index[j + 11] = c;
		}

		const position = new Float32Array(new_positions.length * 3);
		for (let i = 0; i < new_positions.length; i += 1) {
			const vector = normalize(new_positions[i]);

			position[i * 3 + 0] = vector[0];
			position[i * 3 + 1] = vector[1];
			position[i * 3 + 2] = vector[2];
		}

		return new Geometry({
			position: new Attribute({ data: position, size: 3 }),
			normal: new Attribute({ data: position, size: 3 })
		}, { index })
	}

	function compute_smooth_geometry(subdivisions = 0) {
		if (!smooth_geometry[subdivisions]) {
			const geometry = compute_smooth_geometry(subdivisions - 1);
			smooth_geometry[subdivisions] = subdivide(geometry);
		}

		return smooth_geometry[subdivisions];
	}
</script>

<script>
	import Mesh from '../scene/Mesh.svelte';

	export let subdivisions = 1;
	export let shading = 'smooth';

	$: geometry = shading === 'smooth'
		? compute_smooth_geometry(subdivisions)
		: compute_flat_geometry(subdivisions);
</script>

<Mesh {...$$props} {geometry}/>