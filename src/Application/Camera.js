import * as THREE from 'three';
import Application from './Application.js';

import gsap from 'gsap';

export default class Camera {
    constructor() {
        this.application = new Application();

        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.debug = this.application.debug;
        this.clock = this.application.clock;

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera');
        }

        this.setInstance();
        this.setControls();

        this.clock.on('tick', () => this.update());
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(33, this.sizes.width / this.sizes.height, 10, 7000);
        this.instance.position.set(800, 3055, 2910);
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
        if (this.application.monitor && this.application.monitor.isIframeActive) {
            const iframeRect = this.application.monitor.iframe.getBoundingClientRect();
            if (
                event.clientX < iframeRect.left ||
                event.clientX > iframeRect.right ||
                event.clientY < iframeRect.top ||
                event.clientY > iframeRect.bottom
            ) {
                return;
            }
        }

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    applyRotation() {
        // Inverted rotation on X axis for correct behavior when moving up and down
        const targetRotationX = this.mouse.y * this.rotationFactor;
        const targetRotationY = -this.mouse.x * this.rotationFactor;

        this.instance.rotation.x = THREE.MathUtils.lerp(this.instance.rotation.x, targetRotationX, 0.1);
        this.instance.rotation.y = THREE.MathUtils.lerp(this.instance.rotation.y, targetRotationY, 0.1);
    }

    moveToPosition(targetPosition) {
        gsap.to(this.instance.position, {
            duration: 1.5,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            onUpdate: () => this.instance.updateProjectionMatrix(),
            ease: "power2.inOut"
        });
    }

    calculateDistanceToIframe() {
        if (!this.application.monitor || !this.application.monitor.object) return Infinity;

        const iframePosition = new THREE.Vector3();
        this.application.monitor.object.getWorldPosition(iframePosition);

        return this.instance.position.distanceTo(iframePosition);
    }

    update() {
        if (!this.application.monitor || this.application.monitor.isIframeActive) return;
        this.applyRotation();

        const distanceToIframe = this.calculateDistanceToIframe();
        const visibilityThreshold = 2200;

        if (distanceToIframe < visibilityThreshold) {
            this.application.monitor.setIframeVisibility(false);
        } else {
            this.application.monitor.setIframeVisibility(true);
        }
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }
}