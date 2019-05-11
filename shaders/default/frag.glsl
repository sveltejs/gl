varying vec3 vnormal;

void main () {
	vec3 lighting = vec3(0.0, 0.0, 0.0);

	// directional lights
	for (int i = 0; i < 8; i += 1) {
		DirectionalLight light = DIRECTIONAL_LIGHTS[i];

		float multiplier = clamp(dot(vnormal, -light.direction), 0.0, 1.0);
		lighting += multiplier * light.color.rgb * light.intensity;
	}

	// point lights
	for (int i = 0; i < 8; i += 1) {
		vec3 direction = POINT_LIGHTS_LOCATION[i];
		vec4 color = POINT_LIGHTS_COLOR[i];

		float multiplier = clamp(dot(vnormal, direction), 0.0, 1.0);
		lighting += multiplier * color.rgb * color.a;
	}

	gl_FragColor = vec4(COLOR, 1.0);
	gl_FragColor.rgb *= mix(AMBIENT_LIGHT, vec3(1.0, 1.0, 1.0), lighting);
}