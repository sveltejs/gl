import { getContext, setContext, onDestroy } from 'svelte';

export const RENDERER = {};
export const LAYER = {};
export const PARENT = {};

export function get_scene() {
	return getContext(RENDERER);
}

export function get_layer() {
	return getContext(LAYER);
}

export function get_parent() {
	return getContext(PARENT);
}

export function set_layer(layer) {
	setContext(LAYER, layer);
}

export function set_parent(parent) {
	setContext(PARENT, parent);
}

function remove_index(array, index) {
	array[index] = array[array.length - 1];
	array.pop();
}

function remove_item(array, item) {
	const index = array.indexOf(item);
	if (~index) remove_index(array, index);
}

export function create_layer(index, invalidate) {
	let child_index = 0;

	const meshes = [];
	const child_layers = [];

	const layer = {
		index: 0,
		meshes,
		child_layers,
		needs_sort: false,
		add_mesh: mesh => {
			meshes.push(mesh);

			onDestroy(() => {
				remove_item(meshes, mesh);
				invalidate();
			});
		},
		add_child: (index = child_index++) => {
			const child_layer = create_layer(index, invalidate);
			child_layers.push(child_layer);

			layer.needs_sort = true;

			onDestroy(() => {
				remove_item(child_layers, child_layer);

				layer.needs_sort = true;
				invalidate();
			});

			return child_layer;
		}
	};

	return layer;
}