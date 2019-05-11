<script>
	import { setContext, onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { RENDERER, LAYER, PARENT, CAMERA, create_layer } from '../../internal/index.mjs';
	import { get_or_create_program } from './program.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	export let background = [1, 1, 1, 1];

	let canvas;
	let w;
	let h;

	let gl;
	let program; // for now, have a single master program
	let draw;
	let camera;
	let camera_stores = {
		view: writable(),
		view_inverse_transpose: writable(),
		projection: writable()
	};

	const width = writable(1);
	const height = writable(1);

	const root_layer = create_layer(0, invalidate);

	const default_camera = { /* TODO */ };
	const num_lights = 8;

	const meshes = [];

	// lights
	const lights = {
		ambient: [],
		directional: {
			items: [],
			direction_data: new Float32Array(num_lights * 3),
			color_data: new Float32Array(num_lights * 4)
		},
		point: {
			items: [],
			location_data: new Float32Array(num_lights * 3),
			color_data: new Float32Array(num_lights * 4)
		}
	};

	let update_scheduled = false;

	function invalidate() {
		if (!update_scheduled) {
			update_scheduled = true;
			requestAnimationFrame(draw);
		}
	}

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

	const scene = {
		add_camera: _camera => {
			if (camera) {
				throw new Error(`A scene can only have one camera`);
			}

			camera = _camera;
			invalidate();

			// TODO this is garbage
			camera_stores.projection.set(camera.projection);
			camera_stores.view_inverse_transpose.set(camera.view_inverse_transpose);
			camera_stores.view.set(camera.view);

			onDestroy(() => {
				camera = null;
				invalidate();
			});
		},

		add_directional_light: add_to(lights.directional.items),
		add_point_light: add_to(lights.point.items),
		add_ambient_light: add_to(lights.ambient),

		create_program(material) {
			return get_or_create_program(gl, material);
		},

		delete_program(program) {
			//gl.deleteProgram(program.program);
		},

		invalidate,

		view: camera_stores.view,
		view_inverse_transpose: camera_stores.view_inverse_transpose,
		projection: camera_stores.projection,
		width,
		height
	};

	setContext(RENDERER, scene);
	setContext(LAYER, root_layer);

	const origin = mat4.identity(mat4.create());
	const ctm = writable(origin);
	setContext(PARENT, {
		get_matrix_world: () => origin,
		ctm: { subscribe: ctm.subscribe }
	});

	// TEMP
	export let blend;
	$: (blend, draw && invalidate());

	onMount(() => {
		gl = scene.gl = canvas.getContext('webgl');

		const ext = gl.getExtension('OES_element_index_uint');

		draw = () => {
			if (!camera) return; // TODO make this `!ready` or something instead

			update_scheduled = false;

			gl.clearColor(...background);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			// gl.blendFunc(gl[sfactor], gl[dfactor]);
			// gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);

			gl.useProgram(program);

			// calculate matrixes
			const { projection, view, view_inverse_transpose } = camera || default_camera;

			// for overlays
			camera_stores.view.set(view);
			camera_stores.view_inverse_transpose.set(view_inverse_transpose);
			camera_stores.projection.set(projection);

			// calculate lights
			const ambient_light = lights.ambient.reduce((total, light) => {
				const { color } = light();

				return [
					Math.min(total[0] + color[0] * color[3], 1),
					Math.min(total[1] + color[1] * color[3], 1),
					Math.min(total[2] + color[2] * color[3], 1)
				];
			}, new Float32Array([0, 0, 0]));

			for (let i = 0; i < num_lights; i += 1) {
				const light = lights.directional.items[i];

				if (light) {
					const { direction, color } = light();

					lights.directional.direction_data[i * 3 + 0] = -direction[0];
					lights.directional.direction_data[i * 3 + 1] = -direction[1];
					lights.directional.direction_data[i * 3 + 2] = -direction[2];

					lights.directional.color_data[i * 4 + 0] = color[0];
					lights.directional.color_data[i * 4 + 1] = color[1];
					lights.directional.color_data[i * 4 + 2] = color[2];
					lights.directional.color_data[i * 4 + 3] = color[3];
				} else {
					lights.directional.direction_data[i * 3 + 0] = 0;
					lights.directional.direction_data[i * 3 + 1] = 0;
					lights.directional.direction_data[i * 3 + 2] = 0;

					lights.directional.color_data[i * 4 + 0] = 0;
					lights.directional.color_data[i * 4 + 1] = 0;
					lights.directional.color_data[i * 4 + 2] = 0;
					lights.directional.color_data[i * 4 + 3] = 0;
				}
			}

			for (let i = 0; i < num_lights; i += 1) {
				const light = lights.point.items[i];

				if (light) {
					const { location, color } = light();

					lights.point.location_data[i * 3 + 0] = location[0];
					lights.point.location_data[i * 3 + 1] = location[1];
					lights.point.location_data[i * 3 + 2] = location[2];

					lights.point.color_data[i * 4 + 0] = color[0];
					lights.point.color_data[i * 4 + 1] = color[1];
					lights.point.color_data[i * 4 + 2] = color[2];
					lights.point.color_data[i * 4 + 3] = color[3];
				} else {
					lights.point.location_data[i * 3 + 0] = 0;
					lights.point.location_data[i * 3 + 1] = 0;
					lights.point.location_data[i * 3 + 2] = 0;

					lights.point.color_data[i * 4 + 0] = 0;
					lights.point.color_data[i * 4 + 1] = 0;
					lights.point.color_data[i * 4 + 2] = 0;
					lights.point.color_data[i * 4 + 3] = 0;
				}
			}

			let previous_program;

			function render_mesh({ matrix_world, geometry, material, program }) {
				// TODO...
				// if (material.blend === 'multiply') {
				// 	gl.blendFuncSeparate(gl[blend.srgb], gl[blend.drgb], gl[blend.salpha], gl[blend.dalpha]);
				// } else {
					gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
				// }

				if (program !== previous_program) {
					gl.useProgram(program.program);

					// set built-ins
					gl.uniform3fv(program.uniform_locations.AMBIENT_LIGHT, ambient_light);

					gl.uniform3fv(program.uniform_locations.DIRECTIONAL_LIGHTS_DIRECTION, lights.directional.direction_data);
					gl.uniform4fv(program.uniform_locations.DIRECTIONAL_LIGHTS_COLOR, lights.directional.color_data);

					gl.uniform3fv(program.uniform_locations.POINT_LIGHTS_LOCATION, lights.point.location_data);
					gl.uniform4fv(program.uniform_locations.POINT_LIGHTS_COLOR, lights.point.color_data);

					gl.uniformMatrix4fv(program.uniform_locations.VIEW_INVERSE_TRANSPOSE, false, view_inverse_transpose);
					gl.uniformMatrix4fv(program.uniform_locations.VIEW, false, view);
					gl.uniformMatrix4fv(program.uniform_locations.PROJECTION, false, projection);

					previous_program = program;
				}

				// set mesh-specific built-in uniforms
				gl.uniformMatrix4fv(program.uniform_locations.MODEL, false, matrix_world);
				// gl.uniform4fv(program.uniform_locations.COLOR, material.uniforms.color); // TODO should maybe be an attribute? not sure

				// set material-specific built-in uniforms
				material.set_uniforms(gl, program.uniforms, program.uniform_locations);

				// set attributes
				geometry.set_attributes(gl);

				// draw
				if (geometry.index) {
					const elements_buffer = gl.createBuffer();
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements_buffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);

					gl.drawElements(gl[geometry.primitive], geometry.index.length, gl.UNSIGNED_INT, 0);
				} else {
					const primitiveType = gl.TRIANGLES;
					const offset = 0;
					const position = geometry.get_attribute('position');
					const count = position.data.length / position.size;
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

					if (mesh.material.uniforms.color[3] < 1) {
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
	});

	// TODO just set a dirty flag if dimensions change?
	$: if (gl) {
		const DPR = window.devicePixelRatio || 1;
		canvas.width = $width * DPR;
		canvas.height = $height * DPR;
		gl.viewport(0, 0, $width * DPR, $height * DPR);
		draw();
	}
</script>

<style>
	.container, canvas {
		position: relative;
		width: 100%;
		height: 100%;
		display: block;
	}
</style>

<div class="container" bind:clientWidth={$width} bind:clientHeight={$height}>
	<canvas bind:this={canvas}></canvas>

	{#if gl}
		<slot></slot>
	{/if}
</div>