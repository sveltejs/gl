// mesh uniforms
#if defined(has_colormap) || defined(has_specularitymap) || defined(has_normalmap) || defined(has_bumpmap)
#define has_textures true
#endif

#ifdef has_textures
varying vec2 v_uv;
#endif

#ifdef has_specularity
uniform float specularity;
#endif

#ifdef has_colormap
uniform sampler2D colormap;
#endif

#ifdef has_specularitymap
uniform sampler2D specularitymap;
#endif

#ifdef has_bumpmap
uniform sampler2D bumpmap;

// adapted from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/bumpmap_pars_fragment.glsl.js
// https://github.com/mrdoob/three.js/blob/dev/LICENSE
vec2 dHdxy_fwd() {
	vec2 dSTdx = dFdx(v_uv);
	vec2 dSTdy = dFdy(v_uv);

	float Hll = texture2D(bumpmap, v_uv).x;
	float dBx = texture2D(bumpmap, v_uv + dSTdx).x - Hll;
	float dBy = texture2D(bumpmap, v_uv + dSTdy).x - Hll;

	#ifdef has_bumpscale
	Hll *= bumpscale;
	dBx *= bumpscale;
	dBy *= bumpscale;
	#endif

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

#ifdef has_bumpscale
uniform float bumpscale;
#endif

#ifdef has_normalmap
uniform sampler2D normalmap;

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
	vec3 mapN = texture2D(normalmap, v_uv).xyz * 2.0 - 1.0;

	// TODO
	// mapN.xy *= NORMAL_SCALE;

	mapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);
	return normalize(tsn * mapN);
}
#endif

#ifdef has_color
uniform vec3 color;
#endif

#ifdef has_alpha
uniform float alpha;
#endif

varying vec3 v_normal;

#if defined(has_normalmap) || defined(has_bumpmap)
varying vec3 v_view_position;
#endif

varying vec3 v_surface_to_light[NUM_LIGHTS];
varying vec3 v_surface_to_view[NUM_LIGHTS];

void main () {
	vec3 normal = normalize(v_normal);

	#ifdef has_bumpmap
		normal = perturbNormalArb(-v_view_position, normal, dHdxy_fwd());
	#elif defined(has_normalmap)
		normal = perturbNormal2Arb(-v_view_position, normal);
	#endif

	vec3 lighting = vec3(0.0);
	vec3 spec_amount = vec3(0.0);

	// directional lights
	for (int i = 0; i < NUM_LIGHTS; i += 1) {
		DirectionalLight light = DIRECTIONAL_LIGHTS[i];

		float multiplier = clamp(dot(normal, -light.direction), 0.0, 1.0);
		lighting += multiplier * light.color * light.intensity;
	}

	// point lights
	for (int i = 0; i < NUM_LIGHTS; i += 1) {
		PointLight light = POINT_LIGHTS[i];

		vec3 surface_to_light = normalize(v_surface_to_light[i]);

		float multiplier = clamp(dot(normal, surface_to_light), 0.0, 1.0); // TODO is clamp necessary?
		lighting += multiplier * light.color * light.intensity;

		#ifdef has_specularity
			vec3 surface_to_view = normalize(v_surface_to_view[i]);
			vec3 half_vector = normalize(surface_to_light + surface_to_view);
			float spec = clamp(dot(normal, half_vector), 0.0, 1.0);

			#ifdef has_specularitymap
			spec *= texture2D(specularitymap, v_uv).r;
			#endif

			spec_amount += specularity * spec * light.color * light.intensity;
		#endif
	}

	#if defined(has_colormap)
	gl_FragColor = texture2D(colormap, v_uv);
	#elif defined(has_color)
	gl_FragColor = vec4(color, 1.0);
	#endif

	#ifdef has_alpha
	gl_FragColor.a = alpha;
	#endif

	gl_FragColor.rgb *= mix(AMBIENT_LIGHT, vec3(1.0, 1.0, 1.0), lighting);
	gl_FragColor.rgb += spec_amount;
}