#define PI 3.141592653589793
#define PI2 6.283185307179586

uniform vec3 u_hover;
uniform vec2 u_uvRate;
uniform float u_hoverScale;
uniform float u_hoverXGap;
uniform float u_time;
uniform sampler2D u_texture;

varying vec2 v_uv;
varying vec2 v_uv1;

// attribute vec3 position;


void main () {
  v_uv = uv;
  vec2 _uv = uv - .5;
  // v_uv1 = (_uv * u_uvRate.xy) + .5;
  v_uv1 = uv;

  vec2 xy = uv;
  xy -= u_hover.xy;
  xy *= u_uvRate;

  // float z = sin((length(xy) - u_time) * PI * 5.0) * 0.04;
  // float mask = pow(1.0 - length(xy), .10);
  // z *= mask;
  float z = sin((length(xy) - u_time) * PI * 15.0) * 0.08 * u_hover.z;
  float mask = pow(1.0 - length(xy), 5.);
  z *= mask;

  vec3 _position = vec3(position.x, position.y, position.z + z);
  _position *= u_hoverScale;
  _position.x += u_hoverXGap;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(_position, 1.0);
}