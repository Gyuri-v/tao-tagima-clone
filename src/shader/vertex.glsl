uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform sampler2D u_texture;

varying vec2 vUv;

// attribute vec3 position;

void main () {
  vUv = uv;

  // position
  vec4 modelPosition = modelMatrix * vec4(position, 1.);
  // modelPosition.z += sin(modelPosition.x * 10. + u_time) * .1;
  // modelPosition.z += sin(modelPosition.x * 10. + u_time) * .1;
  // modelPosition.x += cos(modelPosition.y * 10. + u_time) * .01;

  // float dist = length(modelPosition.xy);
  // modelPosition.y += sin(dist) * .01;
  modelPosition.y += u_scroll;

  // position setting
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}