import * as THREE from "three";

export const VHSShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "time": { value: 0.0 },
        "resolution": { value: new THREE.Vector2() },
        "scanlineIntensity": { value: 0.1 }, // Intensité des lignes de balayage
        "desaturationFactor": { value: 0.3 }, // Facteur de désaturation
        "distortionStrength": { value: 0.02 } // Force de la distorsion chromatique
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform vec2 resolution;
        uniform float scanlineIntensity;
        uniform float desaturationFactor;
        uniform float distortionStrength;

        vec3 applyScanlines(vec3 color, vec2 uv) {
            float scanline = sin(uv.y * resolution.y * 0.5) * scanlineIntensity;
            return color + scanline;
        }

        vec3 applyDesaturation(vec3 color, float factor) {
            float gray = dot(color, vec3(0.3, 0.59, 0.11)); // Calculer l'intensité en niveaux de gris
            return mix(color, vec3(gray), factor);
        }

        vec3 applyChromaticDistortion(vec2 uv) {
            // Décalage des canaux de couleur
            float offset = distortionStrength * sin(time);
            float r = texture2D(tDiffuse, uv + vec2(offset, 0.0)).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv - vec2(offset, 0.0)).b;
            return vec3(r, g, b);
        }

        void main() {
            vec2 uv = vUv;
            
            // Effet de bruit VHS
            float noise = (fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5) * 0.1;
            vec3 color = texture2D(tDiffuse, uv).rgb + noise;

            // Appliquer les lignes de balayage
            color = applyScanlines(color, uv);

            // Appliquer la désaturation
            color = applyDesaturation(color, desaturationFactor);

            // Appliquer la distorsion chromatique
            color = applyChromaticDistortion(uv);

            // Ajouter un effet de vignettage plus fort
            float dist = length(uv - 0.5);
            float vignette = smoothstep(0.3, 0.5, dist);
            color *= (1.0 - vignette) * 1.5;

            gl_FragColor = vec4(color, 1.0);
        }
    `
};
