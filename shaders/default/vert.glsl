varying vec3 vnormal;

void main() {
	vnormal = normalize(NORMAL);
	gl_Position = PROJECTION * VIEW * MODEL * vec4(POSITION, 1.0);
}