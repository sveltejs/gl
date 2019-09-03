# Taxonomy

This is a rough attempt to organise the various concepts in Svelte GL. It is subject to change.


## Scene

The root component. A `<Scene>` creates a container element and a canvas, and manages all the entities inside, determining when to redraw.

A scene contains one or more *layers*, and exactly one *camera*.

> It's possible to imagine that we might want to decouple the scene from the canvas — e.g. we might want to view the same scene from different angles (as in a 3D editor) or render a scene to a texture.


## Layer

Clears the depth buffer, guaranteeing that objects contained within are drawn on top of whatever is on lower layers. Particularly useful in situations where you'd otherwise experience z-fighting.

The first layer is 'implicit' — you don't need to create a `<Layer>` component inside your scene if everything will be on the same layer.

Layers contain zero or more *objects*.


## Object

An object is something with a transform (a location and rotation and a scale).

### Group

A logical grouping of objects that can be used to apply transformations to all of them simultaneously.

### Camera

Cameras are objects, whose sole purpose is to generate the view matrix, which manifests as a scene-wide *uniform*.

### Light

Lights also manifest as scene-wide uniforms.

### Mesh

Meshes are objects with a *geometry* and a *material*. They are the only things that actually get drawn, other than overlays.


## Geometry

A geometry is a collection of *attributes*, a primitive (e.g. triangle), and an (optional) index.

An attribute is a typed array (normally a Float32Array, I think?) plus a size.

> There are also `normalized` and `dynamic` properties, which don't currently do anything?

## Material

A material is a combination of a WebGL *program* and a number of uniforms that pertain to that program. Some of those uniforms are 'well known', such as alpha, specularity, colorMap and so on. Some may be specific to the program's shader, if it's not using a default shader.

Each mesh has its own material. Many materials can share the same program.


## Open questions

* How can we make it easy to share materials between meshes while also making it easy to define materials in an ad-hoc way as props on meshes (and their wrappers)?

* Geometries and materials need to belong to a scene (or more accurately, to the `gl` context associated with the scene, though it's useful if they have a reference to the scene so that they can invalidate it). How can we do that in a way that isn't onerous for scene authors?

* In the medium term, is there a way to design the API such that a compiler could omit built-in shader chunks that weren't used?

* How can we make shader chunks composable?