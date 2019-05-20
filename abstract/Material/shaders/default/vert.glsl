varying vec3 v_normal;

#ifdef USES_TEXTURES
varying vec2 v_uv;
#endif

#ifdef USES_NORMAL_MAP
varying vec3 v_view_position;
#endif

varying vec3 v_surface_to_light[NUM_LIGHTS];

#ifdef USES_SPECULARITY
varying vec3 v_surface_to_view[NUM_LIGHTS];
#endif

void main() {
	vec4 pos = vec4(POSITION, 1.0);
	vec4 model_view_pos = VIEW * MODEL * pos;

	v_normal = (MODEL_INVERSE_TRANSPOSE * vec4(NORMAL, 0.0)).xyz;

	#ifdef USES_TEXTURES
	v_uv = UV;
	#endif

	#ifdef USES_NORMAL_MAP
	v_view_position = model_view_pos.xyz;
	#endif

	for (int i = 0; i < NUM_LIGHTS; i += 1) {
		PointLight light = POINT_LIGHTS[i];

		vec3 surface_world_position = (MODEL * pos).xyz;
		v_surface_to_light[i] = light.location - surface_world_position;

		#ifdef USES_SPECULARITY
			v_surface_to_view[i] = CAMERA_WORLD_POSITION - surface_world_position;
		#endif
	}

	gl_Position = PROJECTION * model_view_pos;
}