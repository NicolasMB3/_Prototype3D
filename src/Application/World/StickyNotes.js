import Application from "../Application.js";
import * as THREE from "three";
import InteractiveObject from "../Utils/InteractiveObject.js";
import { CAMERA_SETTINGS } from "../variables.js";

export default class StickyNotes extends InteractiveObject {
    constructor() {

        const application = new Application();
        super(application);

        this.stickyNotes = [];

        this.cursorMessage.innerText = "Lire la note";
        this.defaultMessage = "Lire la note";

        this.createStickyNotes();
        this.initRaycaster(this.stickyNotes);
    }

    createStickyNotes() {
        const stickyNotePositions = [
            { x: -950, y: 3450, z: -1950, wh: 300 },
            { x: -1225, y: 3525, z: -1950, wh: 300 },
            { x: 565, y: 3990, z: -1950, wh: 220 },
            { x: 2485, y: 4175, z: -1950, wh: 220 },
            { x: 2225, y: 3315, z: -450, wh: 220 },
        ];

        stickyNotePositions.forEach((position) => {
            const geometry = new THREE.PlaneGeometry(position.wh, position.wh);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.0,
            });
            const plane = new THREE.Mesh(geometry, material);

            plane.position.set(position.x, position.y, position.z);

            this.scene.add(plane);
            this.stickyNotes.push(plane);
        });
    }

    onObjectClick(stickyNote) {
        const stickyNoteIndex = this.stickyNotes.indexOf(stickyNote);
        const targetPosition = CAMERA_SETTINGS.positions[stickyNoteIndex + 2];

        // Définissez les limites spécifiques autour de la StickyNote
        this.application.camera.cameraLimit = {
            minX: targetPosition.x - 150,
            maxX: targetPosition.x + 150,
            minY: targetPosition.y - 150,
            maxY: targetPosition.y + 150
        };

        this.application.camera.moveToPosition(targetPosition);

        this.isObjectActive = true;
        this.cursorMessage.style.display = "none";
        this.textEffect.stopEffect();
        this.isExitMessageDisplayed = false;
    }

    onObjectExit() {
        super.onObjectExit();
        this.isObjectActive = false;
    }

    // Dans la classe StickyNotes
    onExitClick() {
        super.onExitClick();

        this.application.camera.cameraLimit = {
            minX: -0,
            maxX: 1300,
            minY: 2500,
            maxY: 4000
        };
        this.isObjectActive = false;
    }

}
