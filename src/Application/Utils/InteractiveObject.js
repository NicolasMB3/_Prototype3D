import * as THREE from "three";
import EventEmitter from "../Utils/EventEmitter.js";
import TextEffect from "../Utils/TextEffect.js";
import { CAMERA_SETTINGS } from "../variables.js";

export default class InteractiveObject extends EventEmitter {
    constructor(application) {
        super();
        this.application = application;
        this.application.loadingScreen.loadingEnd = undefined;
        this.scene = this.application.scene;
        this.camera = this.application.camera.instance;
        this.clock = this.application.clock;

        this.raycaster = new THREE.Raycaster(undefined, undefined, 0, undefined);
        this.mouse = new THREE.Vector2();

        this.isMouseOver = false;
        this.isObjectActive = false;
        this.isExitMessageDisplayed = false;
        this.activeInteractiveObject = null;

        this.cursorMessage = document.createElement("div");
        this.cursorMessage.style.position = "absolute";
        this.cursorMessage.classList.add("cursor-message");
        this.cursorMessage.style.display = "none";

        document.body.appendChild(this.cursorMessage);

        this.textEffect = new TextEffect(this.cursorMessage, {
            updateInterval: 4,
            effectDuration: 700,
        });

        this.handleMouseMove = this.updateMousePositionAndIntersects.bind(this);
        this.handleCursorMessageMove = this.updateCursorMessagePosition.bind(this);

        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mousemove", this.handleCursorMessageMove);
        window.addEventListener("click", this.handleMouseClick.bind(this));

        window.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
        window.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
        window.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: false });

        this.interactiveObjects = [];

        this.clock.on("tick", () => {
            this.update();
        });

        this.touchStartTime = 0;
    }

    initRaycaster(objects) {
        this.interactiveObjects = objects;
    }

    updateMousePositionAndIntersects(event) {
        if (!this.application.loadingScreen.loadingEnd) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

        if (intersects.length > 0) {
            this.onObjectMouseOver(intersects[0].object);
        } else {
            this.onObjectMouseOut();
        }
    }

    handleMouseClick() {
        if (!this.application.loadingScreen.loadingEnd) return;

        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        if (intersects.length > 0) {
            this.onObjectClick(intersects[0].object);
        } else if (this.isObjectActive) {
            this.onExitClick();
            this.cursorMessage.style.display = 'none';
        }
    }

    handleTouchStart(event) {
        if (event.touches.length === 1) {
            this.updateMousePositionAndIntersects(event.touches[0]);
            this.touchStartTime = new Date().getTime();
        }
    }

    handleTouchMove(event) {
        if (event.touches.length === 1) {
            this.updateMousePositionAndIntersects(event.touches[0]);
            this.updateCursorMessagePosition(event.touches[0]);
        }
    }

    handleTouchEnd(event) {
        if (!this.application.loadingScreen.loadingEnd) return;

        const touchEndTime = new Date().getTime();
        if (touchEndTime - this.touchStartTime < 300) {
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
            if (intersects.length > 0) {
                this.onObjectClick(intersects[0].object);
            } else if (this.isExitMessageDisplayed) {
                this.onExitClick();
                this.cursorMessage.style.display = 'none';
            }
        }
    }

    onObjectMouseOver(object) {
        if (!this.isMouseOver && this.application.loadingScreen.loadingEnd) {
            this.isMouseOver = true;
            this.trigger("object:mouseover");

            if (object.userData && object.userData.onMouseOver) {
                object.userData.onMouseOver();
            }

            document.body.classList.add("cursor-pointer");

            if (this.isExitMessageDisplayed && this.isObjectActive) {
                this.cursorMessage.style.display = "none";
                this.textEffect.stopEffect();
            } else if (!this.activeInteractiveObject || this.activeInteractiveObject === object) {
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

            document.body.classList.remove("cursor-pointer");

            if (this.activeInteractiveObject && this.activeInteractiveObject.userData && this.activeInteractiveObject.userData.onMouseOut) {
                this.activeInteractiveObject.userData.onMouseOut();
            }

            if (this.isObjectActive) {
                this.displayExitMessage();
            } else {
                this.cursorMessage.style.display = "none";
                this.textEffect.stopEffect();
                this.isExitMessageDisplayed = false;
            }
        }
    }

    displayExitMessage() {
        this.cursorMessage.innerText = "Cliquez pour quitter";
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
        this.activeInteractiveObject = object;

        if (object.userData && object.userData.onClick) {
            object.userData.onClick();
        }
    }

    onExitClick() {
        this.animateCameraToDefault(() => {
            this.isObjectActive = false;
            this.cursorMessage.style.display = "none";
            this.textEffect.stopEffect();
            this.isExitMessageDisplayed = false;
            this.onObjectExit();
            this.activeInteractiveObject = null;
            this.cursorMessage.style.display = 'none';
        });
    }

    animateCameraToDefault(onComplete) {
        const defaultPosition = CAMERA_SETTINGS.positions[0];
        const defaultRotation = new THREE.Euler(0, 0, 0);

        this.application.camera.animatePositionAndRotation(defaultPosition, defaultRotation, onComplete);
    }

    onObjectExit() {
        this.cursorMessage.innerText = this.defaultMessage || "Action";
    }

    update() {
        if (this.isObjectActive && this.isIframeActive) {
            const iframeRect = this.iframe.getBoundingClientRect();
            const mouseX = ((this.mouse.x + 1) / 2) * window.innerWidth;
            const mouseY = ((1 - this.mouse.y) / 2) * window.innerHeight;

            if (mouseX >= iframeRect.left && mouseX <= iframeRect.right && mouseY >= iframeRect.top && mouseY <= iframeRect.bottom) {
                this.application.canvas.style.pointerEvents = "none";
                this.iframe.style.pointerEvents = "auto";
            } else {
                this.application.canvas.style.pointerEvents = "auto";
                this.iframe.style.pointerEvents = "none";
            }
        }
    }
}