varying vec3 vnormal;
varying vec3 vsurface_to_light[8];

void main() {
	vec4 pos = vec4(POSITION, 1.0);

	vnormal = normalize(MODEL_INVERSE_TRANSPOSE * vec4(NORMAL, 0.0)).xyz;

	for (int i = 0; i < 8; i += 1) {
		PointLight light = POINT_LIGHTS[i];

		vec3 surface_world_position = (MODEL * pos).xyz;
		vsurface_to_light[i] = light.location - surface_world_position;
	}

	gl_Position = PROJECTION * VIEW * MODEL * pos;
}