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

	function rotate(x, y) {
		// TODO handle the up vector. for now, just assume [0,1,0]
		const vx = location[0] - target[0];
		const vy = location[1] - target[1];
		const vz = location[2] - target[2];

		const radius = Math.sqrt(vx * vx + vy * vy + vz * vz);

		let theta = Math.atan2(vx, vz);
		theta -= x;

		let phi = Math.acos(yootils.clamp(vy / radius, -1, 1));
		phi = yootils.clamp(phi - y, EPSILON, Math.PI - EPSILON);
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
			const x = -direction[0] * dy;
			const z = -direction[1] * dy;

			location[0] += x;
			location[2] += z;

			target[0] += x;
			target[2] += z;
		}

		// delta x = tangent to xz
		{
			const tangent = normalize([-vz, vx]);
			const x = tangent[0] * dx;
			const z = tangent[1] * dx;

			location[0] += x;
			location[2] += z;

			target[0] += x
			target[2] += z;
		}
	}

	function zoom(amount) {
		let vx = location[0] - target[0];
		let vy = location[1] - target[1];
		let vz = location[2] - target[2];

		vx /= amount;
		vy /= amount;
		vz /= amount;

		location[0] = target[0] + vx;
		location[1] = target[1] + vy;
		location[2] = target[2] + vz;
	}

	function handle_mousedown(event) {
		let last_x = event.clientX;
		let last_y = event.clientY;

		const handle_mousemove = debounce(event => {
			const x = event.clientX;
			const y = event.clientY;

			const dx = x - last_x;
			const dy = y - last_y;

			if (event.shiftKey || event.which === 2) {
				pan(dx * 0.01, dy * 0.01);
			} else {
				rotate(dx * 0.005, dy * 0.005);
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
		zoom(Math.pow(1.004, event.wheelDeltaY));
	});

	function handle_mousewheel(event) {
		event.preventDefault();
		mousewheel_zoom(event);
	}

	function start_rotate(event) {
		event.preventDefault();

		const touch = event.touches[0];
		const finger = touch.identifier;

		let last_x = touch.clientX;
		let last_y = touch.clientY;

		const handle_touchmove = debounce(event => {
			if (event.touches.length > 1) return;

			const touch = event.touches[0];
			if (touch.identifier !== finger) return;

			const dx = (touch.clientX - last_x);
			const dy = (touch.clientY - last_y);

			rotate(dx * 0.003, dy * 0.003);

			last_x = touch.clientX;
			last_y = touch.clientY;;
		});

		function handle_touchend(event) {
			let i = event.changedTouches.length;

			while (i--) {
				const touch = event.changedTouches[i];
				if (touch.identifier === finger) {
					window.removeEventListener('touchmove', handle_touchmove);
					window.removeEventListener('touchend', handle_touchend);

					return;
				}
			}
		}

		window.addEventListener('touchmove', handle_touchmove);
		window.addEventListener('touchend', handle_touchend);
	}

	function pythag(a, b) {
		return Math.sqrt(a * a + b * b);
	}

	function start_pan_zoom(event) {
		event.preventDefault();

		const touch_a = event.touches[0];
		const touch_b = event.touches[1];

		const finger_a = touch_a.identifier;
		const finger_b = touch_b.identifier;

		let last_cx = (touch_a.clientX + touch_b.clientX) / 2;
		let last_cy = (touch_a.clientY + touch_b.clientY) / 2;
		let last_d = pythag(touch_b.clientX - touch_a.clientX, touch_b.clientY - touch_a.clientY);

		const handle_touchmove = debounce(event => {
			if (event.touches.length !== 2) {
				alert(`${event.touches.length} touches`);
				return;
			}

			const touch_a = event.touches[0];
			const touch_b = event.touches[1];

			if (touch_a.identifier !== finger_a && touch_a.identifier !== finger_b) return;
			if (touch_b.identifier !== finger_a && touch_b.identifier !== finger_b) return;

			const cx = (touch_a.clientX + touch_b.clientX) / 2;
			const cy = (touch_a.clientY + touch_b.clientY) / 2;
			const d = pythag(touch_b.clientX - touch_a.clientX, touch_b.clientY - touch_a.clientY);

			const dx = cx - last_cx;
			const dy = cy - last_cy;

			pan(dx * 0.01, dy * 0.01);
			zoom(d / last_d);

			last_cx = cx;
			last_cy = cy;
			last_d = d;
		});

		function handle_touchend(event) {
			let i = event.changedTouches.length;

			while (i--) {
				const touch = event.changedTouches[i];
				if (touch.identifier === finger_a || touch.identifier === finger_b) {
					window.removeEventListener('touchmove', handle_touchmove);
					window.removeEventListener('touchend', handle_touchend);

					return;
				}
			}
		}

		window.addEventListener('touchmove', handle_touchmove);
		window.addEventListener('touchend', handle_touchend);
	}

	function handle_touchstart(event) {
		if (event.touches.length === 1) {
			start_rotate(event);
		}

		if (event.touches.length === 2) {
			start_pan_zoom(event);
		}
	}

	scene.canvas.addEventListener('mousedown', handle_mousedown);
	scene.canvas.addEventListener('mousewheel', handle_mousewheel);
	scene.canvas.addEventListener('touchstart', handle_touchstart);

	onDestroy(() => {
		scene.canvas.removeEventListener('mousedown', handle_mousedown);
		scene.canvas.removeEventListener('mousewheel', handle_mousewheel);
		scene.canvas.removeEventListener('touchstart', handle_touchstart);
	});
</script>

<slot {location} {target}></slot>