import { getContext, setContext, onDestroy } from 'svelte';

export const RENDERER = {};
export const LAYER = {};
export const PARENT = {};
export const CAMERA = {};

export function get_scene() {
	return getContext(RENDERER);
}

export function get_layer() {
	return getContext(LAYER);
}

export function get_parent() {
	return getContext(PARENT);
}

export function get_camera() {
	return getContext(CAMERA);
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
	const transparent_meshes = [];
	const child_layers = [];

	const layer = {
		index: 0,
		meshes,
		transparent_meshes,
		child_layers,
		needs_sort: false,
		needs_transparency_sort: true,
		add_mesh: (mesh, existing) => {
			if (existing) {
				remove_item(mesh.transparent ? meshes : transparent_meshes, mesh);
			}

			if (mesh.transparent) {
				transparent_meshes.push(mesh);
				layer.needs_transparency_sort = true;
			} else {
				meshes.push(mesh);
			}

			onDestroy(() => {
				remove_item(meshes, mesh);
				remove_item(transparent_meshes, mesh);
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