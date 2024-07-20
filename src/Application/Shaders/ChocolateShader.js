import * as THREE from "three";

export const chocolateShader = {
    uniforms: {
        "uTime": { value: 0 },
        "uTimeFrequency": { value: 0.001 },
        "uUvFrequency": { value: new THREE.Vector2(0.8, 2.0) },
        "uColor": { value: new THREE.Color('#c9c9c9') },
        "uAlpha": { value: 0.6 }
    },
    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec2 uUvFrequency;
        uniform vec3 uColor;
        uniform float uAlpha;
        varying vec2 vUv;

        // Fonction de bruit améliorée
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);

            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) + 
                   (c - a) * u.y * (1.0 - u.x) + 
                   (d - b) * u.x * u.y;
        }

        // Fonction de bruit fractal pour un effet de fumée plus complexe
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(p);
                p *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            float noiseValue = fbm(vUv * uUvFrequency + vec2(uTime * 0.02, uTime * 0.01));

            float smoke = smoothstep(0.4, 1.0, noiseValue);

            vec3 color = uColor * smoke;

            gl_FragColor = vec4(color, smoke * uAlpha);
        }
    `
};
