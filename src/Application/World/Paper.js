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

        this.position = { x: -725, y: 2238, z: -442 };
        this.size = { w: 400, h: 510 };
        this.color = 0xffffff;
        this.opacity = 0;

        this.application = application;
        this.camera = application.camera.instance;

        this.drawing = false;
        this.currentLine = null;
        this.points = [];
        this.isClicked = false;
        this.lineColor = 0x000000; // Default line color
        this.erasing = false; // Eraser mode off by default

        this.createPlane();
        this.initRaycaster([this.plane, this.smallPlane1, this.smallPlane2]);

        // Event listeners for drawing and erasing
        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));

        this.createEraserCircle();
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
        plane.rotateZ(0.015);

        this.scene.add(plane);
        this.plane = plane;

        plane.userData.onMouseOver = () => this.onPaperMouseOver();
        plane.userData.onMouseOut = () => this.onPaperMouseOut();
        plane.userData.onClick = () => this.onPaperClick();

        // Create the first small plane
        const smallGeometry1 = new THREE.PlaneGeometry(25, 25);
        const smallMaterial1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
        const smallPlane1 = new THREE.Mesh(smallGeometry1, smallMaterial1);

        smallPlane1.position.set(this.position.x + 165, this.position.y + 2, this.position.z - 225);
        smallPlane1.rotation.copy(plane.rotation);

        this.scene.add(smallPlane1);
        this.smallPlane1 = smallPlane1;

        smallPlane1.userData.onClick = () => this.activateEraserMode();

        // Create the second small plane
        const smallGeometry2 = new THREE.PlaneGeometry(25, 25);
        const smallMaterial2 = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black color
        const smallPlane2 = new THREE.Mesh(smallGeometry2, smallMaterial2);

        smallPlane2.position.set(this.position.x + 135, this.position.y + 2, this.position.z - 225);
        smallPlane2.rotation.copy(plane.rotation);

        this.scene.add(smallPlane2);
        this.smallPlane2 = smallPlane2;

        smallPlane2.userData.onClick = () => this.changeLineColorToBlue();
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
        const targetRotation = new THREE.Euler(-Math.PI / 3, 0, 0);
        const targetPosition = CAMERA_SETTINGS.positions[8];

        this.application.camera.animatePositionAndRotation(targetPosition, targetRotation, () => {
            this.application.camera.setFixedRotation(targetRotation);
            this.isClicked = true;
        });
    }

    onMouseDown(event) {
        if (!this.isClicked) return;

        const intersects = this.raycaster.intersectObjects([this.plane, this.smallPlane1, this.smallPlane2]);
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject === this.smallPlane1) {
                this.activateEraserMode();
            } else if (intersectedObject === this.smallPlane2) {
                this.changeLineColorToBlue();
            } else {
                if (this.erasing) {
                    this.erasing = true;
                    this.eraseLine(event);
                } else {
                    this.drawing = true;
                    this.points = [];
                    this.addPoint(event);
                }
            }
        }
    }

    onMouseMove(event) {
        if (this.drawing) {
            this.addPoint(event);
            this.drawLine();
        } else if (this.erasing) {
            this.eraseLine(event);
        }

        this.updateEraserCircle(event);
    }

    onMouseUp(event) {
        this.drawing = false;
        this.erasing = false;
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
            color: this.lineColor,
            linewidth: 1.3,
            worldUnits: true,
        });
        material.resolution.set(window.innerWidth, window.innerHeight);

        this.currentLine = new Line2(geometry, material);
        this.scene.add(this.currentLine);
    }

    eraseLine(event) {
        const eraserRadius = 3; // Adjust the eraser radius as needed
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children);
        intersects.forEach(intersect => {
            if (intersect.object.isLine2) {
                const line = intersect.object;
                const linePoints = line.geometry.attributes.position.array;
                const newLinePoints = [];

                for (let i = 0; i < linePoints.length; i += 3) {
                    const point = new THREE.Vector3(linePoints[i], linePoints[i + 1], linePoints[i + 2]);
                    if (point.distanceTo(intersect.point) > eraserRadius) {
                        newLinePoints.push(point.x, point.y, point.z);
                    }
                }

                if (newLinePoints.length > 0) {
                    line.geometry.setPositions(newLinePoints);
                    line.geometry.attributes.position.needsUpdate = true;
                } else {
                    this.scene.remove(line);
                }
            }
        });
    }

    changeLineColorToBlue() {
        this.lineColor = 0x0000ff; // Blue color
        this.erasing = false;
    }

    activateEraserMode() {
        this.erasing = true;
        this.drawing = false;
    }

    createEraserCircle() {
        const geometry = new THREE.CircleGeometry(3, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.7, transparent: true });
        this.eraserCircle = new THREE.Mesh(geometry, material);
        this.eraserCircle.visible = false;
        this.scene.add(this.eraserCircle);
    }

    updateEraserCircle(event) {
        if (!this.erasing) {
            this.eraserCircle.visible = false;
            return;
        }

        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);

        const intersects = this.raycaster.intersectObject(this.plane);
        if (intersects.length > 0) {
            this.eraserCircle.position.copy(intersects[0].point);
            this.eraserCircle.visible = true;
        } else {
            this.eraserCircle.visible = false;
        }
    }
}
