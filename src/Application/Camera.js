import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Application from './Application.js';

export default class Camera {
    constructor() {
        this.application = new Application();

        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.canvas = this.application.canvas;
        this.debug = this.application.debug;

        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera');
        }

        this.setInstance();
        this.setControls();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 10, 50000);
        this.instance.position.set(1680, 2665, 3279);
        this.scene.add(this.instance);

        // Set the camera to look at a specific point, e.g., the position of iframe
        this.targetPosition = new THREE.Vector3(835, 2970, -760); // Position of the iframe
        this.instance.lookAt(this.targetPosition);

        // Debug
        if(this.debug.active) {
            this.debugFolder.add(this.instance.position, 'x').min(-5000).max(5000).step(1).name('Position X');
            this.debugFolder.add(this.instance.position, 'y').min(-5000).max(5000).step(1).name('Position Y');
            this.debugFolder.add(this.instance.position, 'z').min(-5000).max(5000).step(1).name('Position Z');
        }
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
        this.controls.target.copy(this.targetPosition);
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        this.instance.lookAt(this.targetPosition);
        this.controls.update();
    }
}
