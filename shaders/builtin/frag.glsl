precision mediump float;

uniform vec3 AMBIENT_LIGHT;

uniform sampler2D TEXTURE;

struct DirectionalLight {
	vec3 direction;
	vec3 color;
	float intensity;
};

uniform DirectionalLight DIRECTIONAL_LIGHTS[8];

struct PointLight {
	vec3 location;
	vec3 color;
	float intensity;
	// TODO fall-off etc
};

uniform PointLight POINT_LIGHTS[8];

uniform vec3 COLOR;