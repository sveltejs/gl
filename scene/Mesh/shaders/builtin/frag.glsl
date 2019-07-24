#extension GL_OES_standard_derivatives : enable

/* start builtins */
precision highp float;

struct DirectionalLight {
	vec3 direction;
	vec3 color;
	float intensity;
};

struct PointLight {
	vec3 location;
	vec3 color;
	float intensity;
	// TODO fall-off etc
};

uniform vec3 AMBIENT_LIGHT;
uniform DirectionalLight DIRECTIONAL_LIGHTS[NUM_LIGHTS];
uniform PointLight POINT_LIGHTS[NUM_LIGHTS];
/* end builtins */