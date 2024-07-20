export const noiseShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "intensity": { value: 0.1 }
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
        uniform float intensity;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            vec2 st = vUv * vec2(10.0, 10.0); // Ajustez l'échelle du bruit
            vec3 color = texture2D(tDiffuse, vUv).rgb;
            // Générer une valeur aléatoire fixe pour chaque pixel
            float noise = random(st);
            color += noise * intensity;
            gl_FragColor = vec4(color, 1.0);
        }
    `
};
