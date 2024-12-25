precision mediump float;
uniform float u_time;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(800, 600);
  float glitchStrength = 0.02;
  float glitchTime = floor(u_time * 0.8);
  vec2 glitchOffset = vec2(
    random(vec2(glitchTime, uv.y)) * 2.0 - 1.0,
    random(vec2(glitchTime + 1.0, uv.x)) * 2.0 - 1.0
  ) * glitchStrength;

  vec2 distortedUV = uv + glitchOffset;
  distortedUV += 0.01 * sin(distortedUV.yx * 8.0 + u_time * 0.3);

  float wave = sin(distortedUV.x * 4.0 + u_time * 0.2) *
              sin(distortedUV.y * 3.0 - u_time * 0.15) *
              sin((distortedUV.x + distortedUV.y) * 2.0 + u_time * 0.3);

  float noise = random(distortedUV + u_time * 0.05) * 0.05;
  float color = 0.35 + 0.25 * wave + noise;

  // Cooler, more muted color palette
  vec3 finalColor = vec3(
    color * 0.8,  // Reduced red
    color * 0.85, // Slightly more green for a colder feel
    color * 0.95  // More blue bias
  );

  gl_FragColor = vec4(finalColor, 1.0);
}
