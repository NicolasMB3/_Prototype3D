import * as THREE from 'three';
import Application from './Application.js';

import gsap from 'gsap';

export default class LoadingScreen {
    constructor() {
        this.application = new Application();

        this.sizes = this.application.sizes;

        this.canvas = this.application.loadingCanvas;
        this.camera = new THREE.OrthographicCamera(
            this.sizes.width / -2,
            this.sizes.width / 2,
            this.sizes.height / 2,
            this.sizes.height / -2,
            0.1,
            10
        );
        this.camera.position.z = 1;
        this.loadingScene = new THREE.Scene();

        this.progressBar = document.querySelector('#loadingBar');

        this.setInstance();
        this.init();
    }

    setInstance() {
        this.loadingManager = new THREE.LoadingManager(
            () => {
                this.loadComplete();
            }, (url, itemsLoaded, itemsTotal) => {
                this.inLoad(url, itemsLoaded, itemsTotal);
            }
        );

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.canvas.appendChild(this.renderer.domElement);
    }

    loadComplete() {
        gsap.to(this.plane.material.uniforms.uAlpha, {
            value: 0,
            duration: 3,
        });
    }

    inLoad(url, itemsLoaded, itemsTotal) {
        const progress = itemsLoaded / itemsTotal;
        this.progressBar.style.transform = `scaleX(${progress})`;
        console.log(itemsLoaded / itemsTotal);
    }

    getLoadingManager() {
        return this.loadingManager;
    }

    init() {
        this.geometry = new THREE.PlaneGeometry(this.sizes.width, this.sizes.height);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                uAlpha: {
                    value: 1,
                }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
            uniform float uAlpha;
            
                void main() {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
                }
            `
        });
        this.plane = new THREE.Mesh(this.geometry, material);

        this.plane.position.set(0, 0, 0);
        this.loadingScene.add(this.plane);
    }

    resize() {
        this.camera.left = this.sizes.width / -2;
        this.camera.right = this.sizes.width / 2;
        this.camera.top = this.sizes.height / 2;
        this.camera.bottom = this.sizes.height / -2;
        this.camera.updateProjectionMatrix();

        this.plane.geometry.dispose();
        this.plane.geometry = new THREE.PlaneGeometry(this.sizes.width, this.sizes.height);

        this.renderer.setSize(this.sizes.width, this.sizes.height);
    }

    update() {
        this.renderer.render(this.loadingScene, this.camera);
    }
}
