It's very useful to be able to do this:

```html
<Box color={0xff3e00} specularity={0.2} />
```

But it's also important to be able to do this:

```js
// materials.js
import * as GL from '@sveltejs/gl';

export const metal = new GL.Material({
	vert,
	frag,

	uniforms: {
		// ...
	}
});
```

```html
<script>
	import { metal } from './materials.js';
</script>

<Box material={metal} />
```

Ideally, manipulating the material — e.g. setting a texture once it has loaded — would cause the scene to redraw.

It's possible that a material could be shared between multiple scenes. We might also want to customise aspects of the material:

```html
<Scene>
	<Box material={material} color={0xff0000}/>
</Scene>

<Scene>
	<Box material={material} color={0x00ff00}/>
</Scene>
```

For that reason, it might make sense to think in terms of material *instances*:

```html
// Mesh/index.svelte
<script>
	// ...
	import { get_scene, get_layer, get_parent } from '../internal/index.mjs';
	import Material from '../abstract/Material/index.mjs';

	export let vert;
	export let frag;
	export let material = new Material({ vert, frag });
	export let geometry;
	export let location = [0, 0, 0];
	export let rotation = [0, 0, 0];
	export let scale = 1;

	const scene = get_scene();
	const layer = get_layer();
	const parent = get_parent();

	const { ctm } = parent;

	const out = mat4.create();
	const out2 = mat4.create();

	$: scale_array = typeof scale === 'number' ? [scale, scale, scale] : scale;

	$: quaternion = quat.fromEuler(quaternion || quat.create(), ...rotation);
	$: matrix = mat4.fromRotationTranslationScale(matrix || mat4.create(), quaternion, location, scale_array);
	$: model = mat4.multiply(model || mat4.create(), $ctm, matrix);
	$: (geometry, material, _material, model, scene.invalidate());

	const material_instance = material.instantiate(scene);
	$: material_instance.update($$props);

	const mesh = {};
	$: mesh.model = model; // TODO do we need to use a store here?
	$: mesh.model_inverse_transpose = (
		mat4.invert(out2, model),
		mat4.transpose(out2, out2)
	);
	$: mesh.material = material_instance;
	$: mesh.geometry = geometry;

	layer.add_mesh(mesh);

	// ...
</script>
```

> Perhaps geometries should be similarly instantiated? Though geometries have slightly different characteristics (you basically just need one instance per context, because buffers are per-context).

The `$: material_instance.update($$props)` line would iterate over the uniforms and update them from props. It would need to know how to (for example) turn `0xff0000` into `[1,0,0]`.

Any props that don't correspond to uniforms would be ignored.

All this implies that `vert`, `frag`, `material`, `geometry`, `location`, `rotation`, and `scale` (and anything else that gets added in future?) would be reserved as uniform names. Maybe we need to have a convention like `u_color` or `u-color`? (`u-color` feels like it could correspond to a `color` uniform, whereas `u_color` feels like it would correspond to `u_color`, which is less good.)



```html
<Scene>
	<Box material={material} u-color={0x00ff00}/>
</Scene>
```


## Textures

Should it be possible to create textures programmatically? I'm not sure.

We definitely do need to be able to create textures from URLs or images:

```html
<Sphere u-colormap="images/earth.png" u-specmap="images/earth-spec.png"/>
```

A material instance encountering a string could create a texture instance from it (or rather, pull it from a context-level cache).

I guess those props could accept an instance of an `Image` or any of its various analogs (canvas, bitmap from createImageBitmap etc)