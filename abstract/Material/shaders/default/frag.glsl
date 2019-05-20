varying vec3 v_normal;

// TODO had to move this to the top of builtins...
// need a better approach
// #ifdef USES_TEXTURES
// varying vec2 v_uv;
// #endif

#ifdef USES_NORMAL_MAP
vec3 v_view_position;
#endif

varying vec3 v_surface_to_light[NUM_LIGHTS];
varying vec3 v_surface_to_view[NUM_LIGHTS];

void main () {
	vec3 normal = normalize(v_normal);

	#ifdef USES_NORMAL_MAP
		// TODO transform from tangent to object space
		// normal = normalize(texture2D(NORMAL_MAP, v_uv).xyz);

		normal = perturbNormal2Arb(-v_view_position, normal);
	#endif

	vec3 lighting = vec3(0.0);
	vec3 specularity = vec3(0.0);

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

		#ifdef USES_SPECULARITY
			vec3 surface_to_view = normalize(v_surface_to_view[i]);
			vec3 half_vector = normalize(surface_to_light + surface_to_view);
			float spec = clamp(dot(normal, half_vector), 0.0, 1.0);

			#ifdef USES_SPEC_MAP
			spec *= texture2D(SPEC_MAP, v_uv).r;
			#endif

			specularity += spec * light.color * light.intensity;
		#endif
	}

	#ifdef USES_COLOR_MAP
	vec4 color = texture2D(COLOR_MAP, v_uv);
	#else
	vec4 color = vec4(COLOR, 1.0);
	#endif

	gl_FragColor = color;

	#ifdef USES_ALPHA
	gl_FragColor.a = ALPHA;
	#endif

	gl_FragColor.rgb *= mix(AMBIENT_LIGHT, vec3(1.0, 1.0, 1.0), lighting);
	gl_FragColor.rgb += specularity;
}