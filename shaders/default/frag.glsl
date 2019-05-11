varying vec3 vnormal;

void main () {
	vec3 light = vec3(0.0, 0.0, 0.0);

	// directional lights
	for (int i = 0; i < 8; i += 1) {
		vec3 direction = DIRECTIONAL_LIGHTS_DIRECTION[i];
		vec4 color = DIRECTIONAL_LIGHTS_COLOR[i];

		float multiplier = clamp(dot(vnormal, direction), 0.0, 1.0);
		light += multiplier * color.rgb * color.a;
	}

	// point lights
	for (int i = 0; i < 8; i += 1) {
		vec3 direction = POINT_LIGHTS_LOCATION[i];
		vec4 color = POINT_LIGHTS_COLOR[i];

		float multiplier = clamp(dot(vnormal, direction), 0.0, 1.0);
		light += multiplier * color.rgb * color.a;
	}

	gl_FragColor = COLOR;
	gl_FragColor.rgb *= mix(AMBIENT_LIGHT, vec3(1.0, 1.0, 1.0), light);
}