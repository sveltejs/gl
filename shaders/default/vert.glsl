varying vec3 vnormal;

void main() {
	vnormal = normalize(MODEL_INVERSE_TRANSPOSE * vec4(NORMAL, 0.0)).xyz;
	gl_Position = PROJECTION * VIEW * MODEL * vec4(POSITION, 1.0);
}