varying vec3 vnormal;
varying vec3 vsurface_to_light[8];

void main () {
	vec3 lighting = vec3(0.0, 0.0, 0.0);

	// directional lights
	for (int i = 0; i < 8; i += 1) {
		DirectionalLight light = DIRECTIONAL_LIGHTS[i];

		float multiplier = clamp(dot(vnormal, -light.direction), 0.0, 1.0);
		lighting += multiplier * light.color * light.intensity;
	}

	// point lights
	for (int i = 0; i < 8; i += 1) {
		PointLight light = POINT_LIGHTS[i];

		vec3 surface_to_light = normalize(vsurface_to_light[i]);

		float multiplier = clamp(dot(vnormal, surface_to_light), 0.0, 1.0);
		lighting += multiplier * light.color * light.intensity;
	}

	gl_FragColor = vec4(COLOR, 1.0);
	gl_FragColor.rgb *= mix(AMBIENT_LIGHT, vec3(1.0, 1.0, 1.0), lighting);
}