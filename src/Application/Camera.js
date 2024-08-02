import * as THREE from 'three';
import gsap from 'gsap';
import Application from './Application.js';

export default class Camera {
    constructor() {
        this.application = new Application();

        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.debug = this.application.debug;

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera');
        }

        this.setInstance();
        this.setControls();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 10, 7000);
        this.instance.position.set(800, 3555, 2910);
        this.scene.add(this.instance);

        // Debug
        if (this.debug.active) {
            this.debugFolder.add(this.instance.position, 'x').min(-5000).max(5000).step(1).name('Position X');
            this.debugFolder.add(this.instance.position, 'y').min(-5000).max(5000).step(1).name('Position Y');
            this.debugFolder.add(this.instance.position, 'z').min(-5000).max(5000).step(1).name('Position Z');
        }
    }

    setControls() {
        this.mouse = new THREE.Vector2();
        this.rotationFactor = 0.1;

        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    applyRotation() {
        const targetRotationX = this.mouse.y * this.rotationFactor;
        const targetRotationY = -this.mouse.x * this.rotationFactor;

        this.instance.rotation.x = THREE.MathUtils.lerp(this.instance.rotation.x, targetRotationX, 0.1);
        this.instance.rotation.y = THREE.MathUtils.lerp(this.instance.rotation.y, targetRotationY, 0.1);
    }

    animateRotation(targetRotation) {
        gsap.to(this.instance.rotation, {
            duration: 1.2,
            x: targetRotation.x,
            y: targetRotation.y,
            z: targetRotation.z,
            ease: "power2.inOut"
        });
    }

    moveToPosition(targetPosition) {
        gsap.to(this.instance.position, {
            duration: 1.2,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            onUpdate: () => this.instance.updateProjectionMatrix(),
            ease: "power2.inOut"
        });
    }

    update() {
        if (!this.application.monitor || this.application.monitor.isIframeActive) return;
        this.applyRotation();
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }
}