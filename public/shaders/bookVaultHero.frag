precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// Make coordinates centered and independent from the canvas size.
vec2 setupUv() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  return uv;
}

void main() {
  // Coordinate/UV setup.
  vec2 uv = setupUv();

  // Aspect-ratio correction keeps the flowing shapes from stretching.
  uv.x *= u_resolution.x / u_resolution.y;

  // Time-based movement makes the bands flow slowly.
  float time = u_time * 0.12;
  vec2 movingUv = uv;
  movingUv.x += sin(uv.y * 2.4 + time) * 0.16;
  movingUv.y += cos(uv.x * 1.7 - time * 0.8) * 0.08;

  // Mouse influence gently bends the flow toward the pointer.
  vec2 mouse = (u_mouse / u_resolution) * 2.0 - 1.0;
  mouse.x *= u_resolution.x / u_resolution.y;
  movingUv += mouse * 0.045;

  // Aurora/light calculation uses a few soft overlapping bands.
  float bandOne = exp(-4.0 * abs(movingUv.y + sin(movingUv.x * 1.4 + time) * 0.24));
  float bandTwo = exp(-5.0 * abs(movingUv.y - 0.18 + cos(movingUv.x * 1.8 - time * 0.7) * 0.2));
  float glow = smoothstep(1.2, -0.2, length(uv * vec2(0.7, 0.9)));
  float light = bandOne * 0.7 + bandTwo * 0.45 + glow * 0.12;

  // Color palette: deep navy and burgundy with restrained gold, purple, and cyan.
  vec3 navy = vec3(0.025, 0.055, 0.13);
  vec3 burgundy = vec3(0.24, 0.045, 0.12);
  vec3 purple = vec3(0.24, 0.10, 0.30);
  vec3 gold = vec3(0.62, 0.34, 0.12);
  vec3 cyan = vec3(0.08, 0.35, 0.38);
  vec3 color = mix(navy, burgundy, smoothstep(-0.8, 0.8, uv.y));
  color += purple * bandOne * 0.28;
  color += gold * bandTwo * 0.22;
  color += cyan * glow * 0.16;
  color += (purple + gold) * light * 0.08;

  // Grain adds a small amount of texture so the background feels less flat.
  float grain = fract(sin(dot(gl_FragCoord.xy + u_time, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.018;

  // Final output: keep the result dark enough for the light text layer.
  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
