/* start builtins */
precision mediump float;

#extension GL_OES_standard_derivatives : enable

#ifdef USES_TEXTURES
varying vec2 v_uv;
#endif

// mesh uniforms
#ifdef USES_COLOR_MAP
uniform sampler2D COLOR_MAP;
#endif

#ifdef USES_SPEC_MAP
uniform sampler2D SPEC_MAP;
#endif

#ifdef USES_BUMP_MAP
uniform sampler2D BUMP_MAP;
// uniform float BUMP_SCALE;

// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
// http://api.unrealengine.com/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf

// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

vec2 dHdxy_fwd() {
	vec2 dSTdx = dFdx(v_uv);
	vec2 dSTdy = dFdy(v_uv);

	float BUMP_SCALE = 1.0; // TODO parameterise
	float Hll = BUMP_SCALE * texture2D(BUMP_MAP, v_uv).x;
	float dBx = BUMP_SCALE * texture2D(BUMP_MAP, v_uv + dSTdx).x - Hll;
	float dBy = BUMP_SCALE * texture2D(BUMP_MAP, v_uv + dSTdy).x - Hll;

	return vec2(dBx, dBy);
}

vec3 perturbNormalArb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
	// Workaround for Adreno 3XX dFd*(vec3) bug. See https://github.com/mrdoob/three.js/issues/9988
	vec3 vSigmaX = vec3(dFdx(surf_pos.x), dFdx(surf_pos.y), dFdx(surf_pos.z));
	vec3 vSigmaY = vec3(dFdy(surf_pos.x), dFdy(surf_pos.y), dFdy(surf_pos.z));
	vec3 vN = surf_norm;		// normalized

	vec3 R1 = cross(vSigmaY, vN);
	vec3 R2 = cross(vN, vSigmaX);

	float fDet = dot(vSigmaX, R1);

	fDet *= (float(gl_FrontFacing) * 2.0 - 1.0);

	vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
	return normalize(abs(fDet) * surf_norm - vGrad);
}
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