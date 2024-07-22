import * as THREE from "three";
import EventEmitter from "../Utils/EventEmitter.js";
import TextEffect from "../Utils/TextEffect.js";
import { CAMERA_SETTINGS } from "../variables.js";

export default class InteractiveObject extends EventEmitter {
    constructor(application) {
        super();
        this.application = application;
        this.scene = this.application.scene;
        this.camera = this.application.camera.instance;

        this.raycaster = new THREE.Raycaster(undefined, undefined, 0, undefined);
        this.mouse = new THREE.Vector2();

        this.isMouseOver = false;
        this.isObjectActive = false;
        this.isExitMessageDisplayed = false;

        this.cursorMessage = document.createElement("div");
        this.cursorMessage.style.position = "absolute";
        this.cursorMessage.classList.add("cursor-message");
        this.cursorMessage.style.display = "none";

        document.body.appendChild(this.cursorMessage);

        this.textEffect = new TextEffect(this.cursorMessage, {
            updateInterval: 4,
            effectDuration: 700,
        });

        // Update cursor position when the mouse moves
        window.addEventListener(
            "mousemove",
            this.updateMousePositionAndIntersects.bind(this)
        );
        window.addEventListener(
            "mousemove",
            this.updateCursorMessagePosition.bind(this)
        );
        window.addEventListener("click", this.handleMouseClick.bind(this));
    }

    initRaycaster(objects) {
        this.interactiveObjects = objects;
    }

    updateMousePositionAndIntersects(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(
            this.interactiveObjects
        );

        if (intersects.length > 0) {
            this.onObjectMouseOver(intersects[0].object);
        } else {
            this.onObjectMouseOut();
        }
    }

    handleMouseClick() {
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        if (intersects.length > 0) {
            this.onObjectClick(intersects[0].object);
        } else if (this.isExitMessageDisplayed) {
            this.onExitClick();
        }
    }

    onObjectMouseOver() {
        if (!this.isMouseOver) {
            this.isMouseOver = true;
            this.trigger("object:mouseover");

            if (this.isExitMessageDisplayed && this.isObjectActive) {
                this.cursorMessage.style.display = "none";
                this.textEffect.stopEffect();
            } else {
                this.cursorMessage.style.display = "block";
                this.textEffect.startEffect();
            }
        } else if (this.isExitMessageDisplayed) {
            this.cursorMessage.style.display = "none";
            this.textEffect.stopEffect();
            this.isExitMessageDisplayed = false;
        }
    }

    onObjectMouseOut() {
        if (this.isMouseOver) {
            this.isMouseOver = false;
            this.trigger("object:mouseout");

            if (this.isObjectActive) {
                this.displayExitMessage();
            } else {
                this.cursorMessage.style.display = "none";
                this.textEffect.stopEffect();
            }
        }
    }

    displayExitMessage() {
        this.cursorMessage.innerText = "Cliquer pour quitter";
        this.cursorMessage.style.display = "block";
        this.textEffect.startEffect();
        this.isExitMessageDisplayed = true;
    }

    updateCursorMessagePosition(event) {
        if (this.isMouseOver || this.isExitMessageDisplayed) {
            this.cursorMessage.style.left = event.clientX + 10 + "px";
            this.cursorMessage.style.top = event.clientY + 10 + "px";
        }
    }

    onObjectClick(object) {
        this.isObjectActive = true;
        this.cursorMessage.style.display = "none";
        this.textEffect.stopEffect();
        this.isExitMessageDisplayed = false;
    }

    onExitClick() {
        this.application.camera.moveToPosition(CAMERA_SETTINGS.positions[0]);
        this.isObjectActive = false;
        this.cursorMessage.style.display = "none";
        this.textEffect.stopEffect();
        this.isExitMessageDisplayed = false;
        this.onObjectExit();
    }

    onObjectExit() {
        this.cursorMessage.innerText = this.defaultMessage || "Action";
    }

}