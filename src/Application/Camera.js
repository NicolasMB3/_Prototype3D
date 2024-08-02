import * as THREE from 'three';
import gsap from 'gsap';
import Application from './Application.js';

export default class Camera {
    constructor() {
        this.application = new Application();

        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.debug = this.application.debug;

        this.isMobile = this.detectMobile();

        this.preventScrolling();

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Camera');
        }

        this.setInstance();
        this.setControls();
    }

    detectMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    preventScrolling() {
        function preventDefault(e) {
            e.preventDefault();
        }

        function preventDefaultForScrollKeys(e) {
            if (e.keyCode) {
                e.preventDefault();
                return false;
            }
        }

        window.addEventListener('wheel', preventDefault, { passive: false });
        window.addEventListener('touchmove', preventDefault, { passive: false });
        window.addEventListener('keydown', preventDefaultForScrollKeys, { passive: false });
    }

    setInstance() {
        const fov = this.isMobile ? 45 : 35; // Augmenter le FOV si sur mobile
        this.instance = new THREE.PerspectiveCamera(fov, this.sizes.width / this.sizes.height, 10, 7000);
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
        this.previousTouch = new THREE.Vector2();

        // Rotation limits
        this.rotationLimits = this.isMobile ? {
            minX: -Math.PI / 4,
            maxX: Math.PI / 4,
            minY: -Math.PI,
            maxY: Math.PI
        } : {
            minX: -Math.PI / 4,
            maxX: Math.PI / 4,
            minY: -Math.PI / 2,
            maxY: Math.PI / 2
        };

        if (this.isMobile) {
            window.addEventListener('touchstart', (event) => this.onTouchStart(event), { passive: false });
            window.addEventListener('touchmove', (event) => this.onTouchMove(event), { passive: false });
            window.addEventListener('touchend', () => this.onTouchEnd(), { passive: false });
        } else {
            window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.previousTouch.set(touch.clientX, touch.clientY);
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.previousTouch.x;
            const deltaY = touch.clientY - this.previousTouch.y;

            this.mouse.x += deltaX / window.innerWidth * 2;
            this.mouse.y -= deltaY / window.innerHeight * 2;

            this.mouse.x = THREE.MathUtils.clamp(this.mouse.x, -3, 3);
            this.mouse.y = THREE.MathUtils.clamp(this.mouse.y, 0, 0.7);

            this.previousTouch.set(touch.clientX, touch.clientY);
        }
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    applyRotation() {
        const targetRotationX = this.mouse.y * this.rotationFactor;
        const targetRotationY = -this.mouse.x * this.rotationFactor;

        // Apply rotation limits
        const clampedRotationX = THREE.MathUtils.clamp(
            THREE.MathUtils.lerp(this.instance.rotation.x, targetRotationX, 0.1),
            this.rotationLimits.minX,
            this.rotationLimits.maxX
        );
        const clampedRotationY = THREE.MathUtils.clamp(
            THREE.MathUtils.lerp(this.instance.rotation.y, targetRotationY, 0.1),
            this.rotationLimits.minY,
            this.rotationLimits.maxY
        );

        this.instance.rotation.x = clampedRotationX;
        this.instance.rotation.y = clampedRotationY;
    }

    animateRotation(targetRotation) {
        gsap.to(this.instance.rotation, {
            duration: 1.2,
            x: THREE.MathUtils.clamp(targetRotation.x, this.rotationLimits.minX, this.rotationLimits.maxX),
            y: THREE.MathUtils.clamp(targetRotation.y, this.rotationLimits.minY, this.rotationLimits.maxY),
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