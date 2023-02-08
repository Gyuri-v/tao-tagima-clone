uniform float u_time;
uniform sampler2D u_texture;

varying vec2 v_uv;

void main () {
    gl_FragColor = texture2D(u_texture, v_uv);
}



// uniform vec2 u_resolution;
// uniform float u_time;
// uniform sampler2D u_texture;

// varying vec2 vUv;

// void main () {
//     vec2 coord = gl_FragCoord.xy / u_resolution.xy; 

//     float scale = 2.;
//     float offset = .5;

//     float radius = offset;
    
//     coord *= scale;
    
//     vec4 color = texture2D(u_texture, coord);
//     // vec3 color = vec3(.5, .5, 1.); 
    
//     gl_FragColor = color;
// }