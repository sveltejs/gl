<script>
	import * as yootils from 'yootils';
	import { debounce } from './debounce.js';
	import { onDestroy } from 'svelte';
	import { get_scene } from '../internal/index.mjs';
	import { normalize } from '../internal/utils.mjs';

	// TODO check we're not inside a group?
	const scene = get_scene();

	export let location = new Float32Array([1, 3, 5]);
	export let target = new Float32Array([0, 1, 0]);
	export let up = new Float32Array([0, 1, 0]);

	export let minDistance = 0;
	export let maxDistance = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	export let minPolarAngle = 0; // radians
	export let maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	export let minAzimuthAngle = - Infinity; // radians
	export let maxAzimuthAngle = Infinity; // radians

	// Enable damping (inertia). falsy == no damping
	export let damping = false;

	const EPSILON = 0.000001;

	function rotate(dx, dy) {
		// TODO handle the up vector. for now, just assume [0,1,0]
		const vx = location[0] - target[0];
		const vy = location[1] - target[1];
		const vz = location[2] - target[2];

		const radius = Math.sqrt(vx * vx + vy * vy + vz * vz);

		let theta = Math.atan2(vx, vz);
		theta -= dx * 0.005;

		let phi = Math.acos(yootils.clamp(vy / radius, -1, 1));
		phi = yootils.clamp(phi - dy * 0.005, EPSILON, Math.PI - EPSILON);
		phi = yootils.clamp(phi, minPolarAngle, maxPolarAngle);

		const sin_phi_radius = Math.sin(phi) * radius;

		const nx = sin_phi_radius * Math.sin(theta);
		const ny = Math.cos(phi) * radius;
		const nz = sin_phi_radius * Math.cos(theta);

		location[0] = target[0] + nx;
		location[1] = target[1] + ny;
		location[2] = target[2] + nz;
	}

	function pan(dx, dy) {
		// TODO handle the up vector. for now, just assume [0,1,0]
		const vx = location[0] - target[0];
		const vy = location[1] - target[1];
		const vz = location[2] - target[2];

		// delta y = along xz
		{
			const direction = normalize([vx, vz]);
			const x = -direction[0] * dy * 0.01;
			const z = -direction[1] * dy * 0.01;

			location[0] += x
			location[2] += z;

			target[0] += x
			target[2] += z;
		}

		// delta x = tangent to xz
		{
			const tangent = normalize([-vz, vx]);
			const x = tangent[0] * dx * 0.01;
			const z = tangent[1] * dx * 0.01;

			location[0] += x
			location[2] += z;

			target[0] += x
			target[2] += z;
		}
	}

	// TODO touch support
	function handle_mousedown(event) {
		let last_x = event.clientX;
		let last_y = event.clientY;

		const handle_mousemove = debounce(event => {
			const x = event.clientX;
			const y = event.clientY;

			const dx = x - last_x;
			const dy = y - last_y;

			if (event.shiftKey || event.which === 2) {
				pan(dx, dy);
			} else {
				rotate(dx, dy);
			}

			last_x = x;
			last_y = y;
		});

		function handle_mouseup(event) {
			window.removeEventListener('mousemove', handle_mousemove);
			window.removeEventListener('mouseup', handle_mouseup);
		}

		window.addEventListener('mousemove', handle_mousemove);
		window.addEventListener('mouseup', handle_mouseup);
	}

	const mousewheel_zoom = debounce(event => {
		let vx = location[0] - target[0];
		let vy = location[1] - target[1];
		let vz = location[2] - target[2];

		const zoom = Math.pow(1.004, event.wheelDeltaY);

		vx /= zoom;
		vy /= zoom;
		vz /= zoom;

		location[0] = target[0] + vx;
		location[1] = target[1] + vy;
		location[2] = target[2] + vz;
	});

	function handle_mousewheel(event) {
		event.preventDefault();
		mousewheel_zoom(event);
	}

	scene.canvas.addEventListener('mousedown', handle_mousedown);
	scene.canvas.addEventListener('mousewheel', handle_mousewheel);

	onDestroy(() => {
		scene.canvas.removeEventListener('mousedown', handle_mousedown);
		scene.canvas.removeEventListener('mousewheel', handle_mousewheel);
	});
</script>

<slot {location} {target}></slot>