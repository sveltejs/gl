<script>
	import { get_layer, set_layer } from '../internal/index.mjs';

	export let index = undefined;

	set_layer(get_layer().add_child(index));
</script>

<div class="layer">
	<slot></slot>
</div>

<style>
	/* for overlays, create a stacking context */
	.layer {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>