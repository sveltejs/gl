import { getContext } from 'svelte';
import { RENDERER } from '../internal/index.mjs';

export default function createImageLoader() {
	const { load_image } = getContext(RENDERER);
	return load_image;
}