import { create_worker } from './utils.mjs';

const worker_url = (typeof Blob !== 'undefined' && URL.createObjectURL(new Blob(
	[`self.onmessage = e => { self.onmessage = null; eval(e.data); };`],
	{ type: 'application/javascript' }
))) || typeof window !== 'undefined' && window.SVELTE_GL_WORKER_URL;

const image_cache = new Map();

export function load_image(src) {
	if (!worker_url) {
		throw new Error(`Workers cannot be created from Blob URLs in this browser. Please set SVELTE_GL_WORKER_URL`);
	}

	if (!image_cache.has(src)) {
		image_cache.set(src, new Promise((fulfil, reject) => {
			if (typeof createImageBitmap !== 'undefined') {
				// TODO pool workers?
				const worker = create_worker(worker_url, () => {
					self.onmessage = e => {
						fetch(e.data, { mode: 'cors' })
							.then(response => response.blob())
							.then(blobData => createImageBitmap(blobData))
							.then(bitmap => {
								self.postMessage({ bitmap }, [bitmap]);
							})
							.catch(error => {
								self.postMessage({
									error: {
										message: error.message,
										stack: error.stack
									}
								});
							});
					};
				});

				worker.onmessage = e => {
					if (e.data.error) {
						image_cache.delete(src);
						reject(e.data.error);
					}

					else fulfil(e.data.bitmap);
				};

				worker.postMessage(new URL(src, location.href).href);
			} else {
				const img = new Image();
				img.crossOrigin = '';
				img.onload = () => fulfil(img);
				img.onerror = e => {
					image_cache.delete(src);
					reject(e);
				};
				img.src = src;
			}
		}));
	}

	return image_cache.get(src);
}