#extension GL_OES_standard_derivatives : enable

/* start builtins */
precision highp float;


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

#ifdef USES_BUMP_MAP
uniform sampler2D BUMP_MAP;
uniform float BUMP_SCALE;

// adapted from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/bumpmap_pars_fragment.glsl.js
// https://github.com/mrdoob/three.js/blob/dev/LICENSE
vec2 dHdxy_fwd() {
	vec2 dSTdx = dFdx(v_uv);
	vec2 dSTdy = dFdy(v_uv);

	float Hll = BUMP_SCALE * texture2D(BUMP_MAP, v_uv).x;
	float dBx = BUMP_SCALE * texture2D(BUMP_MAP, v_uv + dSTdx).x - Hll;
	float dBy = BUMP_SCALE * texture2D(BUMP_MAP, v_uv + dSTdy).x - Hll;

	return vec2(dBx, dBy);
}

vec3 perturbNormalArb(vec3 surf_pos, vec3 surface_normal, vec2 dHdxy) {
	// Workaround for Adreno 3XX dFd*(vec3) bug. See #9988
	vec3 vSigmaX = vec3(dFdx(surf_pos.x), dFdx(surf_pos.y), dFdx(surf_pos.z));
	vec3 vSigmaY = vec3(dFdy(surf_pos.x), dFdy(surf_pos.y), dFdy(surf_pos.z));
	vec3 vN = surface_normal;

	vec3 R1 = cross(vSigmaY, vN);
	vec3 R2 = cross(vN, vSigmaX);

	float fDet = dot(vSigmaX, R1);

	fDet *= (float(gl_FrontFacing) * 2.0 - 1.0);

	vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
	return normalize(abs(fDet) * surface_normal - vGrad);
}
#endif

#ifdef USES_NORMAL_MAP
uniform sampler2D NORMAL_MAP;

vec3 perturbNormal2Arb(vec3 eye_pos, vec3 surface_normal) {
	// Workaround for Adreno 3XX dFd*(vec3) bug. See https://github.com/mrdoob/three.js/issues/9988
	vec3 q0 = vec3(dFdx(eye_pos.x), dFdx(eye_pos.y), dFdx(eye_pos.z));
	vec3 q1 = vec3(dFdy(eye_pos.x), dFdy(eye_pos.y), dFdy(eye_pos.z));

	vec2 st0 = dFdx(v_uv.st);
	vec2 st1 = dFdy(v_uv.st);

	// TODO derivative functions don't seem to work on some
	// mobile phones - need to investigate
	if (length(q0) == 0.0) {
		return surface_normal;
	}

	float scale = sign(st1.t * st0.s - st0.t * st1.s); // we do not care about the magnitude

	vec3 S = normalize((q0 * st1.t - q1 * st0.t) * scale);
	vec3 T = normalize((-q0 * st1.s + q1 * st0.s) * scale);
	vec3 N = normalize(surface_normal);
	mat3 tsn = mat3(S, T, N);
	vec3 mapN = texture2D(NORMAL_MAP, v_uv).xyz * 2.0 - 1.0;

	// TODO
	// mapN.xy *= NORMAL_SCALE;

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