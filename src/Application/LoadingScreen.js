import * as THREE from 'three';
import Application from './Application.js';
import gsap from 'gsap';
import { CAMERA_SETTINGS } from "./variables.js";

export default class LoadingScreen {
    constructor() {
        this.application = new Application();
        this.sizes = this.application.sizes;
        this.canvas = this.application.loadingCanvas;
        this.loadingEnd = undefined;
        this.isLoadingComplete = false;  // Nouvelle variable pour contrôler l'état de chargement

        this.camera = new THREE.OrthographicCamera(
            this.sizes.width / -2,
            this.sizes.width / 2,
            this.sizes.height / 2,
            this.sizes.height / -2,
            0.1,
            10
        );
        this.camera.position.z = 1;

        this.container = document.querySelector('.container');
        this.loadingScreenElement = document.getElementById('loadingScreen');
        this.counterElement = document.getElementById('autoStartCounter');
        this.currentDateTimeElement = document.getElementById('currentDateTime');

        this.setInstance();
        this.setTimeAndDate();

        // Détection de l'appareil mobile
        this.isMobile = /Mobi|Android/i.test(window.navigator.userAgent);
    }

    setInstructionText() {
        const enterMessage = document.querySelector('#enterMessage')
        if (this.isMobile) {
            enterMessage.innerHTML = 'L\'ECRAN';
        } else {
            enterMessage.innerHTML = 'ENTER';
        }
    }

    addStartEventListeners() {
        if (this.isMobile) {
            // Sur mobile, détecter un touch/click sur l'écran
            this.loadingScreenElement.addEventListener('click', () => {
                if (this.isLoadingComplete) {  // Vérifie si le chargement est terminé
                    this.startLoading();
                }
            });
        } else {
            // Sur desktop, détecter la touche Enter
            window.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && this.isLoadingComplete) {  // Vérifie si le chargement est terminé
                    this.startLoading();
                }
            });
        }
    }

    startLoading() {
        if (this.loadingEnd) return; // Empêche plusieurs déclenchements
        this.loadingEnd = true;
        this.fadeOutLoadingScreen();
    }

    fadeOutLoadingScreen() {
        gsap.to(this.loadingScreenElement, {
            opacity: 0,
            duration: 0.1,
            onComplete: () => {
                this.loadingScreenElement.style.display = 'none';
                this.container.style.display = 'block';
                this.container.classList.add('fade-out');
                this.animateCamera();
            }
        });
    }

    animateCamera() {
        const cameraInstance = this.application.camera.instance;
        const originalPosition = CAMERA_SETTINGS.positions[0];
        gsap.to(cameraInstance.position, {
            duration: 1.2,
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z,
            ease: "power2.inOut"
        });
    }

    setInstance() {
        this.loadingManager = new THREE.LoadingManager(
            () => this.loadComplete(),
            (url, itemsLoaded, itemsTotal) => this.inLoad(url, itemsLoaded, itemsTotal)
        );
    }

    loadComplete() {
        this.isLoadingComplete = true;  // Le chargement est maintenant complet
        document.querySelector('#loadingMessage').style.display = 'none';
        document.querySelectorAll('.p_child').forEach((element) => {
            element.style.display = 'block';
        });

        this.startCountdown();
        this.setInstructionText();
        this.addStartEventListeners();  // Ajoute les événements ici, après le chargement complet
    }

    inLoad(url, itemsLoaded, itemsTotal) {
        this.loadingEnd = false;

        const progress = itemsLoaded / itemsTotal;
        const fileIndex = itemsLoaded;
        const currentFileElement = document.getElementById(`file${fileIndex}`);
        const currentProgressElement = document.getElementById(`progress${fileIndex}`);

        if (currentFileElement) {
            currentFileElement.textContent = `${url}`;
        }

        if (currentProgressElement) {
            currentProgressElement.textContent = `: ${Math.floor((progress * 100) * 2.82)}%`;
        }
    }

    startCountdown() {
        let counter = 10;
        const countdown = setInterval(() => {
            counter -= 1;
            this.counterElement.textContent = counter;
            if (counter <= 0) {
                clearInterval(countdown);
                if (!this.loadingEnd) {
                    this.startLoading(); // Démarre automatiquement le chargement si le compte à rebours atteint 0
                }
            }
        }, 1000);
    }

    getLoadingManager() {
        return this.loadingManager;
    }

    setTimeAndDate() {
        const now = new Date();
        const formattedDateTime = now.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.currentDateTimeElement.textContent = `:${formattedDateTime}`;
    }

    resize() {
        this.camera.left = this.sizes.width / -2;
        this.camera.right = this.sizes.width / 2;
        this.camera.top = this.sizes.height / 2;
        this.camera.bottom = this.sizes.height / -2;
        this.camera.updateProjectionMatrix();
    }

    update() {
        this.resize();
    }
}