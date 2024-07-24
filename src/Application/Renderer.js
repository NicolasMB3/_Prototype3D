import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import Application from './Application.js';

import { noiseShader } from "./Shaders/NoiseShader.js";

export default class Renderer {
    constructor() {
        this.application = new Application();

        this.canvas = this.application.canvas;
        this.canvas3D = this.application.canvas3D;
        this.shaderCanvas = this.application.shader;

        this.sizes = this.application.sizes;

        this.scene = this.application.scene;
        this.scene3D = this.application.scene3D;

        this.camera = this.application.camera;

        this.overlayScene = new THREE.Scene();

        this.setInstance();
        this.setPostProcessing();
        this.setOverlay();
    }

    setInstance() {

        // Renderer principal
        this.instance = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.75;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
        this.canvas.appendChild(this.instance.domElement);

        // CSS3DRenderer
        this.instance3D = new CSS3DRenderer();
        this.instance3D.setSize(this.sizes.width, this.sizes.height);
        this.instance3D.domElement.style.position = 'absolute';
        this.instance3D.domElement.style.top = '0px';
        this.canvas3D.appendChild(this.instance3D.domElement);

        this.shaderInstance = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.shaderInstance.setSize(this.sizes.width, this.sizes.height);
        this.shaderInstance.domElement.style.position = 'absolute';
        this.shaderInstance.domElement.style.top = '0px';

        this.shaderInstance.domElement.style.opacity = '0.14';
        this.shaderInstance.domElement.style.pointerEvents = 'none';
        this.shaderCanvas.appendChild(this.shaderInstance.domElement);
    }

    setPostProcessing() {
        this.composer = new EffectComposer(this.shaderInstance);

        this.noisePass = new ShaderPass(noiseShader);
        this.noisePass.uniforms.intensity.value = 0.18;

        this.noisePass.renderToScreen = true;
        this.composer.addPass(this.noisePass);
    }


    setOverlay() {
        this.overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.ShaderMaterial({
                vertexShader: noiseShader.vertexShader,
                fragmentShader: noiseShader.fragmentShader,
                uniforms: noiseShader.uniforms,
                depthTest: false,
                depthWrite: false
            })
        );

        this.overlayScene.add(this.overlay);
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

        this.instance3D.setSize(this.sizes.width, this.sizes.height);

        this.shaderInstance.setSize(this.sizes.width, this.sizes.height);
        this.shaderInstance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    }

    update() {
        this.application.camera.instance.updateProjectionMatrix();

        this.instance.render(this.scene, this.camera.instance);
        this.instance3D.render(this.scene3D, this.camera.instance);
        this.composer.render();

        this.overlay.position.copy(this.camera.instance.position);
    }
}