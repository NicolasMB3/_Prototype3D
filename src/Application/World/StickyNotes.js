import Application from "../Application.js";
import * as THREE from "three";
import InteractiveObject from "../Utils/InteractiveObject.js";
import { CAMERA_SETTINGS } from "../variables.js";
import TextEffect from "../Utils/TextEffect.js";
import { gsap } from "gsap";

export default class StickyNotes extends InteractiveObject {
    constructor() {
        const application = new Application();
        super(application);

        this.stickyNotes = [];
        this.cursorMessage.innerText = "Lire la note";
        this.defaultMessage = "Lire la note";
        this.isStickyNote3Active = false;

        this.createStickyNotes();
        this.initRaycaster(this.stickyNotes);

        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('click', (event) => this.onGlobalClick(event));
    }

    createStickyNotes() {
        const stickyNotePositions = [
            { x: -950, y: 3450, z: -1950, size: 300 },
            { x: -1225, y: 3525, z: -1950, size: 300 },
            { x: 565, y: 3990, z: -1950, size: 220 },
            { x: 2685, y: 3875, z: -1950, size: 220 },
            { x: 2225, y: 3315, z: -450, size: 220 },
        ];

        stickyNotePositions.forEach(({ x, y, z, size }) => {
            const geometry = new THREE.PlaneGeometry(size, size);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0,
            });
            const stickyNote = new THREE.Mesh(geometry, material);

            stickyNote.position.set(x, y, z);
            this.scene.add(stickyNote);
            this.stickyNotes.push(stickyNote);
        });
    }

    onObjectClick(stickyNote) {
        const stickyNoteIndex = this.stickyNotes.indexOf(stickyNote);
        const targetPosition = CAMERA_SETTINGS.positions[stickyNoteIndex + 2];

        this.setCameraLimits(targetPosition);
        this.application.camera.moveToPosition(targetPosition);

        setTimeout(() => this.handleStickyNoteActivation(stickyNoteIndex), 1200);

        this.isObjectActive = true;
        this.cursorMessage.style.display = "none";
        this.textEffect.stopEffect();
        this.isExitMessageDisplayed = false;
    }

    handleStickyNoteActivation(stickyNoteIndex) {
        if (stickyNoteIndex === 2) { // StickyNote 3 index
            this.activateStickyNote3();
            this.cursorMessage.style.display = "none";
        } else {
            this.isStickyNote3Active = false;
        }
    }

    setCameraLimits(targetPosition) {
        this.application.camera.cameraLimit = {
            minX: targetPosition.x - 150,
            maxX: targetPosition.x + 150,
            minY: targetPosition.y - 150,
            maxY: targetPosition.y + 150,
        };
    }

    activateStickyNote3() {
        const uiElement = document.querySelector('#ui');
        gsap.to(uiElement, { opacity: 0.8, display: 'block', duration: 0.1 });

        const textEffect = new TextEffect(uiElement, {
            updateInterval: 5,
            effectDuration: 1000,
        });
        textEffect.startEffect();

        this.isStickyNote3Active = true;
    }

    onKeyDown(event) {
        if ((event.key === 'c' || event.key === 'C') && this.isStickyNote3Active) {
            this.downloadCV();
        }
    }

    downloadCV() {
        const link = document.createElement('a');
        link.href = '/prototype/cv_nicolasbaar.pdf';
        link.download = 'cv_nicolasbaar.pdf';
        link.click();
    }

    onObjectExit() {
        super.onObjectExit();
        this.isObjectActive = false;
        const uiElement = document.querySelector('#ui');
        gsap.to(uiElement, { opacity: 0, duration: 0.5, onComplete: () => { uiElement.style.display = 'none'; } });
        this.cursorMessage.style.display = 'none';
    }

    onExitClick() {
        super.onExitClick();
        this.resetCameraLimits();
        this.isObjectActive = false;
        this.cursorMessage.style.display = 'none';
    }

    resetCameraLimits() {
        this.application.camera.cameraLimit = {
            minX: 0,
            maxX: 1300,
            minY: 2500,
            maxY: 4000,
        };
    }

    onGlobalClick(event) {
        const uiElement = document.querySelector('#ui');
        if (this.isStickyNote3Active && !uiElement.contains(event.target)) {
            gsap.to(uiElement, { opacity: 0, duration: 0.5, onComplete: () => { uiElement.style.display = 'none'; } });
            this.isStickyNote3Active = false;
        }
    }
}