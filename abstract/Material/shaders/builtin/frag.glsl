/* start builtins */
precision mediump float;

// mesh uniforms
#ifdef USES_COLOR_MAP
uniform sampler2D COLOR_MAP;
#endif

#ifdef USES_SPECULARITY_MAP
uniform sampler2D SPECULARITY_MAP;
#endif

uniform vec3 COLOR;

#ifdef USES_ALPHA
uniform float ALPHA;
#endif

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