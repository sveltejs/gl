/* start builtins */
precision mediump float;

#extension GL_OES_standard_derivatives : enable

#ifdef USES_TEXTURES
varying vec2 v_uv;
#endif

// mesh uniforms
#ifdef USES_SPECULARITY
uniform float SPECULARITY;
#endif

#ifdef USES_COLOR_MAP
uniform sampler2D COLOR_MAP;
#endif

#ifdef USES_SPEC_MAP
uniform sampler2D SPEC_MAP;
#endif

#ifdef USES_NORMAL_MAP
uniform sampler2D NORMAL_MAP;
#endif

uniform vec3 COLOR;
uniform float ALPHA;

// lights
uniform vec3 AMBIENT_LIGHT;

struct DirectionalLight {
	vec3 direction;
	vec3 color;
	float intensity;
};

uniform DirectionalLight DIRECTIONAL_LIGHTS[NUM_LIGHTS];

struct PointLight {
	vec3 location;
	vec3 color;
	float intensity;
	// TODO fall-off etc
};

uniform PointLight POINT_LIGHTS[NUM_LIGHTS];
/* end builtins */