precision mediump float;

uniform mat4 MODEL;
uniform mat4 PROJECTION;
uniform mat4 VIEW;
uniform mat4 MODEL_INVERSE_TRANSPOSE;

attribute vec3 POSITION;
attribute vec3 NORMAL;

struct PointLight {
	vec3 location;
	vec3 color;
	float intensity;
	// TODO fall-off etc
};

uniform PointLight POINT_LIGHTS[8];