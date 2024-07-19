import * as THREE from "three";
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import Application from './Application.js';

export default class Renderer {
    constructor() {
        this.application = new Application();

        this.canvas = this.application.canvas;
        this.canvas3D = this.application.canvas3D;

        this.sizes = this.application.sizes;

        this.scene = this.application.scene;
        this.scene3D = this.application.scene3D;

        this.camera = this.application.camera;

        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        })
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1.75
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)

        this.canvas.appendChild(this.instance.domElement)

        this.instance3D = new CSS3DRenderer();
        this.instance3D.setSize(this.sizes.width, this.sizes.height);

        this.canvas3D.appendChild(this.instance3D.domElement);

    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance3D.setSize(this.sizes.width, this.sizes.height)
    }

    update() {
        this.instance.render(this.scene, this.camera.instance)
        this.instance3D.render(this.scene3D, this.camera.instance)
    }

}