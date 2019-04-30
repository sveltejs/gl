precision mediump float;

// uniform vec3 _reverse_light_direction;
// uniform vec3 light_direction;
uniform vec4 light_color;

uniform vec3 _directional_lights_direction[8];
uniform vec4 _directional_lights_color[8];

uniform vec4 _color;

varying vec3 vnormal;

void main () {
	vec3 normal = normalize(vnormal);

	vec3 light = vec3(0.0, 0.0, 0.0);

	for (int i = 0; i < 8; i += 1) {
		vec3 direction = _directional_lights_direction[i];
		vec4 color = _directional_lights_color[i];

		float multiplier = clamp(dot(normal, direction), 0.0, 1.0);
		light += multiplier * color.rgb * color.a;
	}

	// float light = clamp(dot(normal, _reverse_light_direction), 0.0, 1.0);
	// float light = 1.0;

	// vec3 light_direction = _directional_lights_direction[0];

	// float light_amount = clamp(dot(normal, light_direction), 0.0, 1.0);
	// vec3 light = light_amount * light_color.a * light_color.rgb;

	// gl_FragColor = vcolor;
	gl_FragColor = _color;
	gl_FragColor.rgb *= mix(vec3(0.3, 0.3, 0.3), vec3(1.0, 1.0, 1.0), light);

	// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}