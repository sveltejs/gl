attribute vec3 position;
attribute vec3 normal;

varying vec3 v_normal;

#if defined(has_colormap) || defined(has_specularitymap) || defined(has_normalmap) || defined(has_bumpmap)
#define has_textures true
#endif

#ifdef has_textures
attribute vec2 uv;
varying vec2 v_uv;
#endif

#if defined(has_normalmap) || defined(has_bumpmap)
varying vec3 v_view_position;
#endif

varying vec3 v_surface_to_light[NUM_LIGHTS];

#ifdef has_specularity
varying vec3 v_surface_to_view[NUM_LIGHTS];
#endif

void main() {
	vec4 pos = vec4(position, 1.0);
	vec4 model_view_pos = VIEW * MODEL * pos;

	v_normal = (MODEL_INVERSE_TRANSPOSE * vec4(normal, 0.0)).xyz;

	#ifdef has_textures
	v_uv = uv;
	#endif

	#if defined(has_normalmap) || defined(has_bumpmap)
	v_view_position = model_view_pos.xyz;
	#endif

	for (int i = 0; i < NUM_LIGHTS; i += 1) {
		PointLight light = POINT_LIGHTS[i];

		vec3 surface_world_position = (MODEL * pos).xyz;
		v_surface_to_light[i] = light.location - surface_world_position;

		#ifdef has_specularity
		v_surface_to_view[i] = CAMERA_WORLD_POSITION - surface_world_position;
		#endif
	}

	gl_Position = PROJECTION * model_view_pos;
}