import Application from "../Application.js";
import { CSS3DObject } from "three/addons";
import * as THREE from "three";
import InteractiveObject from "../Utils/InteractiveObject.js";
import { IFRAME_WIDTH, IFRAME_HEIGHT, URL_OS, CAMERA_SETTINGS } from "../variables.js";

export default class Monitor extends InteractiveObject {
    constructor() {

        const application = new Application();
        super(application);

        this.scene3D = this.application.scene3D;
        this.size = this.application.sizes;
        this.clock = this.application.clock;
        this.screenSize = new THREE.Vector2(IFRAME_WIDTH, IFRAME_HEIGHT);

        this.position = new THREE.Vector3(835, 2967, -760);
        this.rotation = new THREE.Euler(
            -4.5 * THREE.MathUtils.DEG2RAD,
            -3.5 * THREE.MathUtils.DEG2RAD,
            -0.3 * THREE.MathUtils.DEG2RAD
        );

        this.isIframeActive = false;

        this.cursorMessage.innerText = "Cliquez pour accéder à l'écran";
        this.defaultMessage = "Cliquez pour accéder à l'écran";

        this.createIframe();
        this.createIframeNote();

        this.createIframeNote();
        this.initRaycaster([this.plane]); // Changer de this.mesh à this.plane
    }

    createIframe() {
        this.container = document.createElement("div");
        this.container.style.width = this.screenSize.width + "px";
        this.container.style.height = this.screenSize.height + "px";
        this.container.style.opacity = "1";
        this.container.style.background = "#1d2e2f";

        this.iframe = document.createElement("iframe");
        this.iframe.src = URL_OS;
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
        this.iframe.style.boxSizing = "border-box";
        this.iframe.style.opacity = "1";
        this.iframe.style.pointerEvents = "none";
        this.iframe.title = "PrototypeOS";

        this.container.appendChild(this.iframe);

        this.blendingMesh(this.container);
    }

    blendingMesh(iframeContainer) {
        this.object = new CSS3DObject(iframeContainer);
        this.object.position.copy(this.position);
        this.object.rotation.copy(this.rotation);

        this.scene3D.add(this.object);
        this.blendingMeshMaterial(this.object);
        this.createMeshes(this.object);
        this.createGlassLayer(this.object);
    }

    blendingMeshMaterial(object) {
        this.material = new THREE.MeshLambertMaterial({
            opacity: 0,
            color: new THREE.Color(0x000000),
            blending: THREE.NoBlending,
            side: THREE.DoubleSide,
            transparent: false,
            depthWrite: false,
        });

        this.geometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.position.copy(object.position);
        this.mesh.rotation.copy(object.rotation);
        this.mesh.scale.copy(object.scale);

        this.scene.add(this.mesh);
    }

    createMeshes(cssObject) {
        this.meshBlend = this.createBlendMesh(cssObject);
        this.scene.add(this.meshBlend);

        const fingerprintsTextureMesh = this.createTextureMesh(
            cssObject,
            "./textures/monitor/fingerprints.jpg",
            0.2,
            40.5
        );
        const shadowTextureMesh = this.createTextureMesh(
            cssObject,
            "./textures/monitor/shadow.png",
            1,
            0.4
        );
        const dustTextureMesh = this.createTextureMesh(
            cssObject,
            "./textures/monitor/dust.jpg",
            0.02,
            40.7
        );

        this.scene.add(fingerprintsTextureMesh);
        this.scene.add(shadowTextureMesh);
        this.scene.add(dustTextureMesh);
    }

    createBlendMesh(cssObject) {
        const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            color: new THREE.Color(0x000000),
            blending: THREE.NoBlending,
            transparent: false,
        });
        const geometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        const meshBlend = new THREE.Mesh(geometry, material);

        meshBlend.position.copy(cssObject.position);
        meshBlend.rotation.copy(cssObject.rotation);
        meshBlend.scale.copy(cssObject.scale);

        return meshBlend;
    }

    createTextureMesh(cssObject, texturePath, opacity, zOffset) {
        const texture = new THREE.TextureLoader().load(texturePath);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            opacity: opacity,
        });
        const geometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        const textureMesh = new THREE.Mesh(geometry, material);

        textureMesh.position.copy(cssObject.position);
        textureMesh.rotation.copy(cssObject.rotation);
        textureMesh.scale.copy(cssObject.scale);

        textureMesh.position.z += zOffset;

        return textureMesh;
    }

    createGlassLayer(cssObject) {
        const envMapLoader = new THREE.CubeTextureLoader();
        const envMap = envMapLoader.load([
            "./textures/environmentMap/px.jpg", "./textures/environmentMap/nx.jpg",
            "./textures/environmentMap/py.jpg", "./textures/environmentMap/ny.jpg",
            "./textures/environmentMap/pz.jpg", "./textures/environmentMap/nz.jpg",
        ]);

        const glassGeometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.05,
            metalness: 0.6,
            side: THREE.DoubleSide,
            opacity: 0.12,
            transparent: true,
            envMap: envMap,
            envMapIntensity: 0.065,
        });
        const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);

        glassMesh.position.copy(cssObject.position);
        glassMesh.rotation.copy(cssObject.rotation);
        glassMesh.scale.copy(cssObject.scale);

        glassMesh.position.z += 40;

        this.scene.add(glassMesh);
    }

    onObjectClick(object) {
        if (object === this.plane) {
            this.isIframeActive = true;
            this.cursorMessage.style.display = "none";
            this.textEffect.stopEffect();
            this.isExitMessageDisplayed = false;
            this.isObjectActive = true;
            this.onScreenClick();
        }
    }

    setIframeVisibility(isVisible) {
        this.iframe.style.display = isVisible ? 'block' : 'none';
    }

    createIframeNote() {
        const geometry = new THREE.PlaneGeometry(1050, 930);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0,
        });
        this.plane = new THREE.Mesh(geometry, material);

        this.plane.position.set(835, 2967, -650);
        this.plane.rotation.set(-4.5 * THREE.MathUtils.DEG2RAD, -3.5 * THREE.MathUtils.DEG2RAD, -0.3 * THREE.MathUtils.DEG2RAD);

        this.scene.add(this.plane);
    }

    onScreenClick() {
        const targetPosition = CAMERA_SETTINGS.positions[1];
        this.application.camera.moveToPosition(targetPosition);

        this.isObjectActive = true;
    }

    onObjectExit() {
        this.iframe.style.pointerEvents = "none";
        this.cursorMessage.innerText = this.defaultMessage;

        this.setIframeVisibility(false);
    }

    onExitClick() {
        super.onExitClick();
        this.isIframeActive = false;
    }
}