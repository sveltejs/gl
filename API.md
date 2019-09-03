# Using Svelte GL

You'll need a bundler plugin that recognises .glsl files and turns them into JavaScript strings, e.g. https://github.com/glslify/rollup-plugin-glslify.


## Creating a basic scene

```html
<script>
  import * as GL from '@sveltejs/gl';
</script>

<GL.Scene>
  <GL.PerspectiveCamera location={[4,4,5]} lookAt={[0,0,0]} near={0.01} far={1000}/>

  <!-- light coming from above and to the right -->
  <GL.DirectionalLight direction={[-3,-2,-1]} intensity={1}/>

  <!-- floor -->
  <GL.Mesh
    geometry={GL.plane()}
    rotation={[-90,0,0]}
    scale={10}
    uniforms={{
      color: 0xffffff
    }}
  />

  <!-- box -->
  <GL.Mesh
    geometry={GL.box()}
    location={[0,0.5,0]}
    uniforms={{
      color: from_hex(color)
    }}
  />
</GL.Scene>
```

Each scene needs:

* a top-level `<GL.Scene>` component
* one or more lights — currently we have `<GL.AmbientLight>`, `<GL.PointLight>` and `<GL.DirectionalLight>`
* one or more `<GL.Mesh>` components — the objects in the scene

