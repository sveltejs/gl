/* start builtins */
precision highp float;

uniform mat4 MODEL;
uniform mat4 PROJECTION;
uniform mat4 VIEW;
uniform mat4 MODEL_INVERSE_TRANSPOSE;

uniform vec3 CAMERA_WORLD_POSITION;

attribute vec3 POSITION;
attribute vec3 NORMAL;

#ifdef USES_TEXTURES
attribute vec2 UV;
#endif

struct PointLight {
	vec3 location;
	vec3 color;
	float intensity;
	// TODO fall-off etc
};

uniform PointLight POINT_LIGHTS[NUM_LIGHTS];
/* end builtins */