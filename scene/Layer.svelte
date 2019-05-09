<script>
	import { get_layer, set_layer } from '../internal.mjs';

	export let index = undefined;

	set_layer(get_layer().add_child(index));
</script>

<slot></slot>