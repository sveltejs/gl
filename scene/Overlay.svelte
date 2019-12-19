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
		style="transform: translate({px(x)}, {px(y)})"
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
	}
</style>