# @sveltejs/gl changelog

## 0.0.36

* Squelch missing prop warning

## 0.0.35

* Use `translate3d` with overlays, add `will-change: transform`

## 0.0.34

* Add `doubleSided` property to meshes

## 0.0.33

* Use `requestAnimationFrame` to batch renders

## 0.0.32

* Add `geometry.update(key, data)` method

## 0.0.31

* Squelch some prop warnings
* Add `GL.dodecahedron` geometry

## 0.0.30

* Add `snap` prop to `<Overlay>` components, to snap to pixel

## 0.0.29

* Default to sensible blending

## 0.0.28

* Fix `alpha` uniform behaviour in default shader when using `colormap`
* Fix rendering of non-indexed geometry

## 0.0.27

* Add `<GL.Point>` component
* Add `emissive` and `emissivemap` uniforms to default material

## 0.0.26

* Fix sorting of transparent meshes ([#16](https://github.com/sveltejs/gl/issues/16))

## 0.0.25

* Lose context when scene is destroyed

## 0.0.24

* Work around apparent IntersectionObserver bug

## 0.0.23

* Render on entering viewport

## 0.0.22

* Add an orthographic camera
* Pass width and height into scene
* Sort transparent objects

## 0.0.21

* Make image loading scene-independent

## 0.0.20

* Add `fog` property to `<Scene>`
* `background` property on `<Scene>` now takes an `[r,g,b]` array or `0xrrggbb` value
* `backgroundOpacity` property controls background opacity

## 0.0.19

* Pass through `depthTest` and `blend`
* Allow more than one texture

## 0.0.18

* Overhaul ([#22](https://github.com/sveltejs/gl/pull/22))

## 0.0.17

* Default to crossOrigin images

## 0.0.16

* Allow meshes to receive frag, vert, blend properties

## 0.0.15

* Declare extensions first, due to change in Chrome 75

## 0.0.14

* Allow `pixelRatio` to be specified

## 0.0.13

* Fetch image data in `cors` mode

## 0.0.12

* Only update when canvas is visible

## 0.0.10-11

* Fix resize glitches

## 0.0.9

* Support primitives other than lines

## 0.0.8

* Fix blending formula

## 0.0.7

* Default to `highp` floats
* Work around some shader bug I don't understand
* Depth test by default

## 0.0.6

* Fix serialization of minified code sent to workers

## 0.0.5

* Add `<Target>` component
* Add `user-select: none` on overlays
* Load and decode images off the main thread
* Allow depth testing to be disabled per-material

## 0.0.4

* Bump mapping
* New `Sphere` implementation

## 0.0.3

* Don't reinitialise element buffers unnecessarily
* Enable `minDistance` and `maxDistance` on OrbitControls

## 0.0.2

* Throttle OrbitControls events
* Add touch support to OrbitControls

## 0.0.1

* First experimental release