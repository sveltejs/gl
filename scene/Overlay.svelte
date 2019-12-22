<script>
	import Point from './Point.svelte';

	export let location;
	export let direction;
	export let snap = false;

	$: px = n => `${snap ? Math.round(n) : n}px`;
</script>

<Point {location} {direction} let:x let:y let:vector>
	<span
		class="overlay"
		style="transform: translate3d({px(x)}, {px(y)}, 0)"
	>
		<slot vector={vector}></slot>
	</span>
</Point>

<style>
	.overlay {
		position: absolute;
		left: 0;
		top: 0;
		user-select: none;
		-moz-user-select: none;
		will-change: transform;
	}
</style>