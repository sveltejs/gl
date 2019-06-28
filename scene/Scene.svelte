<script context="module">
	import { readable } from 'svelte/store';

	function get_visibility(node) {
		return readable(false, set => {
			if (typeof IntersectionObserver !== 'undefined') {
				const observer = new IntersectionObserver(entries => {
					set(entries[0].isIntersecting);
				});

				observer.observe(node);
				return () => observer.unobserve(node);
			}

			if (typeof window !== 'undefined') {
				function handler() {
					const { top, bottom } = node.getBoundingClientRect();
					set(bottom > 0 && top < window.innerHeight);
				}

				window.addEventListener('scroll', handler);
				window.addEventListener('resize', handler);

				return () => {
					window.removeEventListener('scroll', handler);
					window.removeEventListener('resize', handler);
				};
			}
		});
	}
</script>

<script>
	import { setContext, onMount, onDestroy, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { RENDERER, LAYER, PARENT, CAMERA, create_layer } from '../internal/index.mjs';
	import { create_worker } from '../internal/utils.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	export let background = [1, 1, 1, 1];
	export let pixelRatio = undefined;
	export let workerUrl = (typeof Blob !== 'undefined' && URL.createObjectURL(new Blob(
		[`self.onmessage = e => { self.onmessage = null; eval(e.data); };`],
		{ type: 'application/javascript' }
	)));

	let canvas;
	let visible = writable(false);
	let w;
	let h;

	let gl;
	let draw;
	let camera_stores = {
		camera_matrix: writable(),
		view: writable(),
		projection: writable()
	};

	const invalidate = typeof window !== 'undefined'
		? () => {
			if (!update_scheduled) {
				update_scheduled = true;
				resolved.then(draw);
			}
		}
		: () => {};

	const width = writable(1);
	const height = writable(1);

	const root_layer = create_layer(0, invalidate);

	const default_camera = { /* TODO */ };
	let camera = default_camera;
	const num_lights = 8;

	const meshes = [];

	// lights
	const lights = {
		ambient: [],
		directional: [],
		point: []
	};

	let update_scheduled = false;
	let resolved = Promise.resolve();

	function add_to(array) {
		return fn => {
			array.push(fn);
			invalidate();

			onDestroy(() => {
				const i = array.indexOf(fn);
				if (~i) array.splice(i, 1);
				invalidate();
			});
		}
	}

	const targets = new Map();

	const scene = {
		add_camera: _camera => {
			if (camera && camera !== default_camera) {
				throw new Error(`A scene can only have one camera`);
			}

			camera = _camera;
			invalidate();

			// TODO this is garbage
			camera_stores.camera_matrix.set(camera.matrix);
			camera_stores.projection.set(camera.projection);
			camera_stores.view.set(camera.view);

			onDestroy(() => {
				camera = default_camera;
				invalidate();
			});
		},

		update_camera: camera => {
			// for overlays
			camera_stores.camera_matrix.set(camera.matrix);
			camera_stores.view.set(camera.view);
			camera_stores.projection.set(camera.projection);
		},

		add_directional_light: add_to(lights.directional),
		add_point_light: add_to(lights.point),
		add_ambient_light: add_to(lights.ambient),

		get_target(id) {
			if (!targets.has(id)) targets.set(id, writable(null))
			return targets.get(id);
		},

		invalidate,

		...camera_stores,

		width,
		height,

		load_image(src) {
			return new Promise((fulfil, reject) => {
				if (typeof createImageBitmap !== 'undefined') {
					// TODO pool workers?
					const worker = create_worker(workerUrl, () => {
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
						if (e.data.error) reject(e.data.error);
						else fulfil(e.data.bitmap);
					};

					worker.postMessage(new URL(src, location.href).href);
				} else {
					const img = new Image();
					img.crossOrigin = '';
					img.onload = () => fulfil(img);
					img.onerror = reject;
					img.src = src;
				}
			});
		}
	};

	setContext(RENDERER, scene);
	setContext(LAYER, root_layer);

	const origin = mat4.identity(mat4.create());
	const ctm = writable(origin);
	setContext(PARENT, {
		get_matrix_world: () => origin,
		ctm: { subscribe: ctm.subscribe }
	});

	onMount(() => {
		scene.canvas = canvas;
		gl = scene.gl = canvas.getContext('webgl');
		visible = get_visibility(canvas);

		const extensions = [
			'OES_element_index_uint',
			'OES_standard_derivatives'
		];

		extensions.forEach(name => {
			const ext = gl.getExtension(name);
			if (!ext) {
				throw new Error(`Unsupported extension: ${name}`);
			}
		});

		draw = force => {
			if (!camera) return; // TODO make this `!ready` or something instead

			if (dimensions_need_update) {
				const DPR = pixelRatio || window.devicePixelRatio || 1;
				canvas.width = $width * DPR;
				canvas.height = $height * DPR;
				gl.viewport(0, 0, $width * DPR, $height * DPR);

				dimensions_need_update = false;
			}

			update_scheduled = false;

			if (!$visible && !force) return;

			gl.clearColor(...background);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.BLEND);

			// calculate total ambient light
			const ambient_light = lights.ambient.reduce((total, { color, intensity }) => {
				return [
					Math.min(total[0] + color[0] * intensity, 1),
					Math.min(total[1] + color[1] * intensity, 1),
					Math.min(total[2] + color[2] * intensity, 1)
				];
			}, new Float32Array([0, 0, 0]));

			let previous_program_info;

			function render_mesh({ model, model_inverse_transpose, geometry, material, program_info }) {
				if (material.depthTest) {
					gl.enable(gl.DEPTH_TEST);
				} else {
					gl.disable(gl.DEPTH_TEST);
				}

				// TODO...
				if (material.blend === 'multiply') {
					gl.blendFuncSeparate(
						gl.SRC_ALPHA, // source rgb
						gl.ONE_MINUS_SRC_ALPHA, // dest rgb
						gl.SRC_ALPHA, // source alpha
						gl.ONE // dest alpha
					);
				} else {
					gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
				}

				if (program_info !== previous_program_info) {
					gl.useProgram(program_info.program);

					// set built-ins
					gl.uniform3fv(program_info.uniform_locations.AMBIENT_LIGHT, ambient_light);

					if (program_info.uniform_locations.DIRECTIONAL_LIGHTS) {
						for (let i = 0; i < num_lights; i += 1) {
							const light = lights.directional[i];
							if (!light) break;

							gl.uniform3fv(program_info.uniform_locations.DIRECTIONAL_LIGHTS[i].direction, light.direction);
							gl.uniform3fv(program_info.uniform_locations.DIRECTIONAL_LIGHTS[i].color, light.color);
							gl.uniform1f(program_info.uniform_locations.DIRECTIONAL_LIGHTS[i].intensity, light.intensity);
						}
					}

					if (program_info.uniform_locations.POINT_LIGHTS) {
						for (let i = 0; i < num_lights; i += 1) {
							const light = lights.point[i];
							if (!light) break;

							gl.uniform3fv(program_info.uniform_locations.POINT_LIGHTS[i].location, light.location);
							gl.uniform3fv(program_info.uniform_locations.POINT_LIGHTS[i].color, light.color);
							gl.uniform1f(program_info.uniform_locations.POINT_LIGHTS[i].intensity, light.intensity);
						}
					}

					gl.uniform3fv(program_info.uniform_locations.CAMERA_WORLD_POSITION, camera.world_position);
					gl.uniformMatrix4fv(program_info.uniform_locations.VIEW, false, camera.view);
					gl.uniformMatrix4fv(program_info.uniform_locations.PROJECTION, false, camera.projection);

					previous_program_info = program_info;
				}

				// set mesh-specific built-in uniforms
				gl.uniformMatrix4fv(program_info.uniform_locations.MODEL, false, model);
				gl.uniformMatrix4fv(program_info.uniform_locations.MODEL_INVERSE_TRANSPOSE, false, model_inverse_transpose);

				// set material-specific built-in uniforms
				material._set_uniforms(gl, program_info.uniforms, program_info.uniform_locations);

				// set attributes
				geometry._set_attributes(gl);

				// draw
				if (geometry.index) {
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.buffers.__index);
					gl.drawElements(gl[geometry.primitive], geometry.index.length, gl.UNSIGNED_INT, 0);
				} else {
					const primitiveType = gl[geometry.primitive];
					const offset = 0;
					const { position } = geometry.attributes;
					const count = position.count;
					gl.drawArrays(primitiveType, offset, count);
				}
			}

			function render_layer(layer) {
				if (layer.needs_sort) {
					layer.child_layers.sort((a, b) => a.index - b.index);
					layer.needs_sort = false;
				}

				gl.depthMask(true);
				gl.clearDepth(1.0);
				gl.clear(gl.DEPTH_BUFFER_BIT);

				const transparent = [];

				for (let i = 0; i < layer.meshes.length; i += 1) {
					const mesh = layer.meshes[i];

					if (mesh.material.alpha < 1) {
						transparent.push(mesh);
					} else {
						render_mesh(mesh);
					}
				}

				// TODO sort transparent meshes, furthest to closest
				gl.depthMask(false);
				transparent.forEach(render_mesh);

				for (let i = 0; i < layer.child_layers.length; i += 1) {
					render_layer(layer.child_layers[i]);
				}
			}

			render_layer(root_layer);
		};

		// for some wacky reason, Adblock Plus seems to prevent the
		// initial dimensions from being correctly reported
		setTimeout(() => {
			$width = canvas.clientWidth;
			$height = canvas.clientHeight;
		});

		tick().then(() => draw(true));
	});

	let dimensions_need_update = true;

	const update_dimensions = () => {
		dimensions_need_update = true;
		invalidate();
	};

	$: ($width, $height, update_dimensions());
</script>

<style>
	.container, canvas {
		position: relative;
		width: 100%;
		height: 100%;
		display: block;
		overflow: hidden;
	}
</style>

<div class="container" bind:clientWidth={$width} bind:clientHeight={$height}>
	<canvas bind:this={canvas}></canvas>

	{#if gl}
		<slot></slot>
	{/if}
</div>