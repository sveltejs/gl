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

vec3 perturbNormal2Arb(vec3 eye_pos, vec3 surface_normal) {
	// return texture2D(NORMAL_MAP, v_uv).xyz;
	// return texture2D(NORMAL_MAP, v_uv).xyz * 2.0 - 1.0;
	// return surface_normal;

	// Workaround for Adreno 3XX dFd*(vec3) bug. See https://github.com/mrdoob/three.js/issues/9988
	// vec3 q0 = vec3(dFdx(eye_pos.x), dFdx(eye_pos.y), dFdx(eye_pos.z));
	// vec3 q1 = vec3(dFdy(eye_pos.x), dFdy(eye_pos.y), dFdy(eye_pos.z));
	vec3 q0 = dFdx(eye_pos.xyz);
	vec3 q1 = dFdy(eye_pos.xyz);

	// return normalize(eye_pos);

	vec2 st0 = dFdx(v_uv.st);
	vec2 st1 = dFdy(v_uv.st);

	float scale = sign(st1.t * st0.s - st0.t * st1.s); // we do not care about the magnitude
	// float scale = 1.0;

	vec3 S = normalize((q0 * st1.t - q1 * st0.t) * scale);
	vec3 T = normalize((-q0 * st1.s + q1 * st0.s) * scale);
	vec3 N = normalize(surface_normal);
	mat3 tsn = mat3(S, T, N);
	vec3 mapN = texture2D(NORMAL_MAP, v_uv).xyz * 2.0 - 1.0;

	// TODO
	// mapN.xy *= normalScale;
	mapN.xy *= 0.5;

	mapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);
	return normalize(tsn * mapN);
}
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