<script>
	import Point from './Point.svelte';

	export let location;
	export let direction;
</script>

<Point {location} {direction} let:x let:y let:vector>
	<span class="overlay" style="transform: translate({x}px, {y}px)">
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