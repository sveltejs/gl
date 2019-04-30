precision mediump float;

uniform mat4 _model;
uniform mat4 _projection;
uniform mat4 _view;
uniform mat4 _view_inverse_transpose;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vnormal;

void main() {
	// vnormal = mat3(_view_inverse_transpose) * normal;
	vnormal = normal;

	gl_Position = _projection * _view * _model * vec4(position, 1.0);
}