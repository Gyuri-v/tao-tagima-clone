uniform float u_time;
uniform float u_progress;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_accel;

varying vec2 v_uv;
varying vec2 v_uv1;

vec2 mirroed (vec2 v) {
  vec2 m = mod(v, 2.);
  return mix(m, 2. - m, step(1., m));
}

float tri (float p) {
	return mix(p, 1. - p, step(.5 ,p)) * 2.;
}

void main () {
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  float progress = fract(u_progress);

  float delay_value = progress*7. - uv.y*2. + uv.x - 2.;
  delay_value = clamp(delay_value, 0., 1.);

  vec2 translate_value = progress + delay_value * u_accel;
  vec2 translate_value1 = vec2(-.5, 1.) * translate_value;
  vec2 translate_value2 = vec2(-.5, 1.) * (translate_value - 1. - u_accel);

  vec2 w = sin( sin(u_time) * vec2(0, .3) + v_uv.yx * vec2(0, 4.) * vec2(0, .5) );
  vec2 xy = w * (tri(progress) * .5 + tri(delay_value) * .5);

  vec2 uv1 = v_uv1 + translate_value1 + xy;
  vec2 uv2 = v_uv1 + translate_value2 + xy;

  vec4 rgba1 = texture2D(u_texture, mirroed(uv1));
  vec4 rgba2 = texture2D(u_texture, mirroed(uv2));

  vec4 rgba = mix(rgba1, rgba2, delay_value);
  gl_FragColor = rgba;
  // gl_FragColor = vec4(0., .0, delay_value, 1.000); 
}