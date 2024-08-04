import Application from "../Application.js";
import * as THREE from "three";
import InteractiveObject from "../Utils/InteractiveObject.js";
import { CAMERA_SETTINGS } from "../variables.js";
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export default class Paper extends InteractiveObject {
    constructor() {
        const application = new Application();
        super(application);

        this.position = { x: -758, y: 2238, z: -442 };
        this.size = { w: 420, h: 530 };
        this.color = 0xffffff;
        this.opacity = 0;

        this.application = application;
        this.camera = application.camera.instance;

        this.drawing = false;
        this.currentLine = null;
        this.points = [];
        this.isClicked = false;

        this.createPlane();
        this.initRaycaster([this.plane]);

        // Event listeners for drawing
        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }

    createPlane() {
        const geometry = new THREE.PlaneGeometry(this.size.w, this.size.h);
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity,
        });
        const plane = new THREE.Mesh(geometry, material);

        plane.position.set(this.position.x, this.position.y, this.position.z);
        plane.rotateX(-Math.PI / 2);
        plane.rotateZ(0.07);

        this.scene.add(plane);
        this.plane = plane;

        plane.userData.onMouseOver = () => this.onPaperMouseOver();
        plane.userData.onMouseOut = () => this.onPaperMouseOut();
        plane.userData.onClick = () => this.onPaperClick();
    }

    onPaperMouseOver() {
        this.cursorMessage.innerText = "Dessiner";
        this.cursorMessage.style.display = "block";
        this.textEffect.startEffect();
    }

    onPaperMouseOut() {
        this.cursorMessage.style.display = "none";
        this.textEffect.stopEffect();
    }

    onPaperClick() {
        const targetRotation = new THREE.Euler(-Math.PI / 2, 0, 0);
        const targetPosition = CAMERA_SETTINGS.positions[8];

        this.application.camera.animatePositionAndRotation(targetPosition, targetRotation, () => {
            this.application.camera.setFixedRotation(targetRotation);
            this.isClicked = true;
        });
    }

    onMouseDown(event) {
        if (!this.isClicked) return;

        const intersects = this.raycaster.intersectObject(this.plane);
        if (intersects.length > 0) {
            this.drawing = true;
            this.points = [];
            this.addPoint(event);
        }
    }

    onMouseMove(event) {
        if (this.drawing) {
            this.addPoint(event);
            this.drawLine();
        }
    }

    onMouseUp(event) {
        this.drawing = false;
        this.currentLine = null;
    }

    addPoint(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);

        const intersects = this.raycaster.intersectObject(this.plane);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.points.push(point.x, point.y, point.z);
        }
    }

    drawLine() {
        if (this.currentLine) {
            this.scene.remove(this.currentLine);
        }

        const geometry = new LineGeometry();
        geometry.setPositions(this.points);

        const material = new LineMaterial({
            color: 0x000000,
            linewidth: 1.3,
            worldUnits: true,
        });
        material.resolution.set(window.innerWidth, window.innerHeight);

        this.currentLine = new Line2(geometry, material);
        this.scene.add(this.currentLine);
    }
}