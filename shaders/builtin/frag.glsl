/* start builtins */
precision mediump float;

uniform vec3 AMBIENT_LIGHT;

#ifdef USES_TEXTURE
uniform sampler2D TEXTURE;
#endif

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

uniform vec3 COLOR;
/* end builtins */