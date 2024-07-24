uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main() {
    vec2 perlinUv = vUv;
    perlinUv.x *= 0.5;
    perlinUv.y *= 0.3;
    perlinUv.y -= uTime * 0.00005;

    float perlin = texture(uPerlinTexture, perlinUv).r;

    perlin = smoothstep(0.4, 1.0, perlin);

    perlin *= smoothstep(0.0, 0.1, vUv.x);
    perlin *= 1.0 - smoothstep(0.9, 1.0, vUv.x);
    perlin *= smoothstep(0.0, 0.1, vUv.y);
    perlin *= 1.0 - smoothstep(0.9, 1.0, vUv.y);

    gl_FragColor = vec4(1.0, 1.0, 1.0, perlin);

    #include <tonemapping_fragment>
    #include <color_fragment>
}