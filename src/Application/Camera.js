import * as THREE from 'three';
import Application from './Application.js';

export default class Camera {
    constructor() {
        this.application = new Application();

        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.canvas = this.application.canvas;
        this.debug = this.application.debug;

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera');
        }

        this.setInstance();
        this.setControls();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 10, 70000);
        this.instance.position.set(800, 2865, 3279);
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
        this.lastMouseMoveTime = Date.now();
        this.mouseStoppedDuration = 0;
        this.cameraSpeed = 4; // Units per second
        this.cameraLimit = {
            minX: -2000,
            maxX: 1800,
            minY: 2100,
            maxY: 3400,
        };
        this.mouseOffset = new THREE.Vector2();

        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.lastMouseMoveTime = Date.now();

        this.mouseOffset.x = this.mouse.x;
        this.mouseOffset.y = this.mouse.y;
    }

    updateMouseStoppedDuration() {
        const now = Date.now();
        const timeSinceLastMove = now - this.lastMouseMoveTime;

        this.mouseStoppedDuration = timeSinceLastMove > 100 ? Math.min(timeSinceLastMove / 1000, 1) : 0;
    }

    calculateCameraMovement(delta) {
        const moveX = this.mouse.x * this.cameraSpeed * delta * (1 - this.mouseStoppedDuration);
        const moveY = this.mouse.y * this.cameraSpeed * delta * (1 - this.mouseStoppedDuration);

        return { moveX, moveY };
    }

    applyCameraLimits(moveX, moveY) {
        const easingDistance = 300;

        const adjustedMoveX = this.applyLimit(moveX, this.instance.position.x, this.cameraLimit.minX, this.cameraLimit.maxX, easingDistance);
        const adjustedMoveY = this.applyLimit(moveY, this.instance.position.y, this.cameraLimit.minY, this.cameraLimit.maxY, easingDistance);

        const targetX = THREE.MathUtils.lerp(this.instance.position.x, this.instance.position.x + adjustedMoveX, 0.5);
        const targetY = THREE.MathUtils.lerp(this.instance.position.y, this.instance.position.y + adjustedMoveY, 0.5);

        this.instance.position.x = Math.max(this.cameraLimit.minX, Math.min(this.cameraLimit.maxX, targetX));
        this.instance.position.y = Math.max(this.cameraLimit.minY, Math.min(this.cameraLimit.maxY, targetY));
    }

    applyLimit(value, currentPosition, minLimit, maxLimit, easingDistance) {
        if (currentPosition < minLimit + easingDistance && value < 0) {
            return value * (currentPosition - minLimit) / easingDistance;
        } else if (currentPosition > maxLimit - easingDistance && value > 0) {
            return value * (maxLimit - currentPosition) / easingDistance;
        }
        return value;
    }

    update() {
        const delta = this.application.clock.delta;
        this.updateMouseStoppedDuration();
        const { moveX, moveY } = this.calculateCameraMovement(delta);
        this.applyCameraLimits(moveX, moveY);
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }
}
