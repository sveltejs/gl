varying vec3 vnormal;

#ifdef USES_TEXTURES
varying vec2 vuv;
#endif

varying vec3 vsurface_to_light[NUM_LIGHTS];
varying vec3 vsurface_to_view[NUM_LIGHTS];

void main() {
	vec4 pos = vec4(POSITION, 1.0);

	vnormal = (MODEL_INVERSE_TRANSPOSE * vec4(NORMAL, 0.0)).xyz;

	#ifdef USES_TEXTURES
	vuv = UV;
	#endif

	for (int i = 0; i < NUM_LIGHTS; i += 1) {
		PointLight light = POINT_LIGHTS[i];

		vec3 surface_world_position = (MODEL * pos).xyz;
		vsurface_to_light[i] = light.location - surface_world_position;
		vsurface_to_view[i] = CAMERA_WORLD_POSITION - surface_world_position;
	}

	gl_Position = PROJECTION * VIEW * MODEL * pos;
}