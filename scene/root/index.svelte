<script>
	import { setContext, onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { RENDERER, PARENT, create_program } from '../../internal.mjs';
	import vert from './vert.glsl.js';
	import frag from './frag.glsl.js';
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

	const width = writable(1);
	const height = writable(1);

	const default_camera = () => ({});
	const num_lights = 8;

	const items = [];

	// lights
	const directional_lights = [];
	const directional_lights_direction_array = new Float32Array(num_lights * 3);
	const directional_lights_color_array = new Float32Array(num_lights * 4);

	const ambient_lights = [];

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

	const context = {
		add_camera: fn => {
			if (camera) {
				throw new Error(`A scene can only have one camera`);
			}

			camera = fn;
			invalidate();

			onDestroy(() => {
				camera = null;
				invalidate();
			});
		},

		add: add_to(items),
		add_directional_light: add_to(directional_lights),
		add_ambient_light: add_to(ambient_lights),

		invalidate,
		width,
		height
	};

	setContext(RENDERER, context);

	const origin = mat4.identity(mat4.create());
	const ctm = writable(origin);
	setContext(PARENT, {
		get_matrix_world: () => origin,
		ctm: { subscribe: ctm.subscribe }
	});

	onMount(() => {
		gl = canvas.getContext('webgl');

		const ext = gl.getExtension('OES_element_index_uint');

		program = create_program(gl, {
			vert,
			frag
		});

		const num_attributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		const num_uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

		const attribute_packages = [];

		for (let i = 0; i < num_attributes; i += 1) {
			const { name } = gl.getActiveAttrib(program, i);

			const loc = gl.getAttribLocation(program, name);
			const buffer = gl.createBuffer();

			const pkg = { name, loc, buffer };
			attribute_packages.push(pkg);
		}

		const uniforms = {
			model: gl.getUniformLocation(program, '_model'),
			view: gl.getUniformLocation(program, '_view'),
			view_inverse_transpose: gl.getUniformLocation(program, '_view_inverse_transpose'),
			projection: gl.getUniformLocation(program, '_projection'),
			ambient_light: gl.getUniformLocation(program, '_ambient_light'),
			directional_lights_direction: gl.getUniformLocation(program, '_directional_lights_direction'),
			directional_lights_color: gl.getUniformLocation(program, '_directional_lights_color'),
			// reverse_light_direction: gl.getUniformLocation(program, '_reverse_light_direction'),
			color: gl.getUniformLocation(program, '_color')
		};

		draw = () => {
			if (!camera) return; // TODO make this `!ready` or something instead

			update_scheduled = false;

			gl.clearColor(...background);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);

			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			gl.useProgram(program);

			// update matrixes
			const { projection, view, view_inverse_transpose } = (camera || default_camera)(canvas.width, canvas.height);

			gl.uniformMatrix4fv(uniforms.view_inverse_transpose, false, view_inverse_transpose);
			gl.uniformMatrix4fv(uniforms.view, false, view);
			gl.uniformMatrix4fv(uniforms.projection, false, projection);

			// update lights
			const ambient_light = ambient_lights.reduce((total, light) => {
				const { color } = light();

				return [
					Math.min(total[0] + color[0] * color[3], 1),
					Math.min(total[1] + color[1] * color[3], 1),
					Math.min(total[2] + color[2] * color[3], 1)
				];
			}, new Float32Array([0, 0, 0]));

			gl.uniform3fv(uniforms.ambient_light, ambient_light);

			for (let i = 0; i < num_lights; i += 1) {
				const light = directional_lights[i];

				if (light) {
					const { direction, color } = light();

					directional_lights_direction_array[i * 3 + 0] = direction[0];
					directional_lights_direction_array[i * 3 + 1] = direction[1];
					directional_lights_direction_array[i * 3 + 2] = direction[2];

					directional_lights_color_array[i * 4 + 0] = color[0];
					directional_lights_color_array[i * 4 + 1] = color[1];
					directional_lights_color_array[i * 4 + 2] = color[2];
					directional_lights_color_array[i * 4 + 3] = color[3];
				} else {
					directional_lights_direction_array[i * 3 + 0] = 0;
					directional_lights_direction_array[i * 3 + 1] = 0;
					directional_lights_direction_array[i * 3 + 2] = 0;

					directional_lights_color_array[i * 4 + 0] = 0;
					directional_lights_color_array[i * 4 + 1] = 0;
					directional_lights_color_array[i * 4 + 2] = 0;
					directional_lights_color_array[i * 4 + 3] = 0;
				}
			}

			gl.uniform3fv(uniforms.directional_lights_direction, directional_lights_direction_array);
			gl.uniform4fv(uniforms.directional_lights_color, directional_lights_color_array);

			gl.uniform3fv(gl.getUniformLocation(program, 'light_direction'), directional_lights_direction_array);
			gl.uniform4fv(gl.getUniformLocation(program, 'light_color'), directional_lights_color_array);

			const transparent = [];

			function render_item({ matrix_world, geometry, material }) {
				// set uniforms
				gl.uniformMatrix4fv(uniforms.model, false, matrix_world);

				gl.uniform4fv(uniforms.color, material.color);


				// set attributes
				attribute_packages.forEach(({ name, loc, buffer, attribute }) => {
					const {
						size = 3,
						type = gl.FLOAT,
						normalized = false,
						stride = 0,
						offset = 0,
						dynamic,
						data
					} = geometry.get_attribute(name);

					// Turn on the attribute
					gl.enableVertexAttribArray(loc);

					// Bind the position buffer.
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.bufferData(gl.ARRAY_BUFFER, data, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW); // TODO feels wrong adding the data here?

					gl.vertexAttribPointer(
						loc,
						size,
						type,
						normalized,
						stride,
						offset
					);
				});

				if (geometry.index) {
					const elements_buffer = gl.createBuffer();
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements_buffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.index, gl.STATIC_DRAW);

					gl.drawElements(gl[geometry.primitive], geometry.index.length, gl.UNSIGNED_INT, 0);
				} else {
					throw new Error(`not implemented: geometry without an index`);
					// var primitiveType = gl.TRIANGLES;
					// var offset = 0;
					// gl.drawArrays(primitiveType, offset, count);
				}
			}

			gl.depthMask(true);
			items.forEach(fn => {
				const item = fn();

				if (item.material.color[3] < 1) {
					transparent.push(item);
				} else {
					render_item(item);
				}
			});

			// TODO sort transparent items, furthest to closest
			gl.depthMask(false);
			transparent.forEach(render_item);
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
		width: 100%;
		height: 100%;
	}
</style>

<div class="container" bind:clientWidth={$width} bind:clientHeight={$height}>
	<canvas bind:this={canvas}></canvas>

	{#if gl}
		<slot></slot>
	{/if}
</div>