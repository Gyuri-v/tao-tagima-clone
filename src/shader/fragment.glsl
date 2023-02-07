uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_texture;

varying vec2 vUv;

void main () {
    // vec2 coord = gl_FragCoord.xy / u_resolution.xy;
    vec4 color = texture2D(u_texture, vUv);
    gl_FragColor = color;
    // gl_FragColor.a = 0.5;

    // gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
}