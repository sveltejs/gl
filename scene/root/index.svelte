<script>
	import { setContext, onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { RENDERER, PARENT, create_program } from '../../internal.mjs';
	import { get_or_create_program } from './program.mjs';
	import vert_builtin from '../../shaders/builtin/vert.glsl.mjs';
	import frag_builtin from '../../shaders/builtin/frag.glsl.mjs';
	import vert_default from '../../shaders/default/vert.glsl.mjs';
	import frag_default from '../../shaders/default/frag.glsl.mjs';
	import * as mat4 from 'gl-matrix/mat4';
	import * as vec3 from 'gl-matrix/vec3';

	// TEMP
	const vert = vert_builtin + vert_default;
	const frag = frag_builtin + frag_default;

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

	const default_camera = { /* TODO */ };
	const num_lights = 8;

	const meshes = [];

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

	const scene = {
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

		add: add_to(meshes),
		add_directional_light: add_to(directional_lights),
		add_ambient_light: add_to(ambient_lights),

		create_program(material) {
			return get_or_create_program(gl, material);
		},

		delete_program(program) {
			//gl.deleteProgram(program.program);
		},

		invalidate,
		width,
		height
	};

	setContext(RENDERER, scene);

	const origin = mat4.identity(mat4.create());
	const ctm = writable(origin);
	setContext(PARENT, {
		get_matrix_world: () => origin,
		ctm: { subscribe: ctm.subscribe }
	});

	onMount(() => {
		gl = scene.gl = canvas.getContext('webgl');

		const ext = gl.getExtension('OES_element_index_uint');

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

			// calculate matrixes
			const { projection, view, view_inverse_transpose } = camera || default_camera;

			// calculate lights
			const ambient_light = ambient_lights.reduce((total, light) => {
				const { color } = light();

				return [
					Math.min(total[0] + color[0] * color[3], 1),
					Math.min(total[1] + color[1] * color[3], 1),
					Math.min(total[2] + color[2] * color[3], 1)
				];
			}, new Float32Array([0, 0, 0]));

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

			const transparent = [];
			let previous_program;

			function render_mesh({ matrix_world, geometry, material, program }) {
				if (program !== previous_program) {
					gl.useProgram(program.program);

					// set built-ins
					gl.uniform3fv(program.uniform_locations.AMBIENT_LIGHT, ambient_light);

					gl.uniform3fv(program.uniform_locations.DIRECTIONAL_LIGHTS_DIRECTION, directional_lights_direction_array);
					gl.uniform4fv(program.uniform_locations.DIRECTIONAL_LIGHTS_COLOR, directional_lights_color_array);

					gl.uniformMatrix4fv(program.uniform_locations.VIEW_INVERSE_TRANSPOSE, false, view_inverse_transpose);
					gl.uniformMatrix4fv(program.uniform_locations.VIEW, false, view);
					gl.uniformMatrix4fv(program.uniform_locations.PROJECTION, false, projection);

					previous_program = program;
				}

				// set mesh-specific built-in uniforms
				gl.uniformMatrix4fv(program.uniform_locations.MODEL, false, matrix_world);
				gl.uniform4fv(program.uniform_locations.COLOR, material.color); // TODO should maybe be an attribute? not sure

				// set attributes
				geometry.set_attributes(gl);

				// draw
				if (geometry.index) {
					console.log('drawing');

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
			meshes.forEach(mesh => {
				if (mesh.material.color[3] < 1) {
					transparent.push(mesh);
				} else {
					render_mesh(mesh);
				}
			});

			// TODO sort transparent meshes, furthest to closest
			gl.depthMask(false);
			transparent.forEach(render_mesh);
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