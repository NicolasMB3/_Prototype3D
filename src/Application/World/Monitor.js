import Application from "../Application.js";
import { CSS3DObject } from "three/addons";
import * as THREE from "three";
import EventEmitter from '../Utils/EventEmitter.js';
import TextEffect from '../Utils/TextEffect.js';
import { IFRAME_WIDTH, IFRAME_HEIGHT, URL_OS } from "../variables.js";

export default class Monitor {
    constructor() {
        this.application = new Application();
        this.scene3D = this.application.scene3D;
        this.scene = this.application.scene;

        this.size = this.application.sizes;
        this.screenSize = new THREE.Vector2(IFRAME_WIDTH, IFRAME_HEIGHT);

        this.position = new THREE.Vector3(835, 2970, -760);
        this.rotation = new THREE.Euler(-4.5 * THREE.MathUtils.DEG2RAD, -3.5 * THREE.MathUtils.DEG2RAD, -0.3 * THREE.MathUtils.DEG2RAD);

        this.isIframeActive = false;
        this.hasEffectStarted = false;

        this.eventEmitter = new EventEmitter();

        this.createIframe();
        this.initRaycaster();
        this.createCursorMessage();
    }

    createIframe() {
        this.container = document.createElement('div');
        this.container.style.width = this.screenSize.width + 'px';
        this.container.style.height = this.screenSize.height + 'px';
        this.container.style.opacity = '1';
        this.container.style.background = '#1d2e2f';

        this.iframe = document.createElement('iframe');
        this.iframe.src = URL_OS;
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.boxSizing = 'border-box';
        this.iframe.style.opacity = '1';
        this.iframe.style.pointerEvents = 'none';
        this.iframe.title = 'PrototypeOS';

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
        this.createGlassLayer(this.object); // Add glass layer
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

        const fingerprintsTextureMesh = this.createTextureMesh(cssObject, './textures/monitor/fingerprints.jpg', 0.14, 40.5);
        const shadowTextureMesh = this.createTextureMesh(cssObject, './textures/monitor/shadow.png', 1, 0.4);
        const dustTextureMesh = this.createTextureMesh(cssObject, './textures/monitor/dust.jpg', 0.02, 40.7);

        this.scene.add(fingerprintsTextureMesh);
        this.scene.add(shadowTextureMesh);
        this.scene.add(dustTextureMesh);
    }

    createBlendMesh(cssObject) {
        const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            color: new THREE.Color(0x000000),
            blending: THREE.NoBlending,
            side: THREE.DoubleSide,
            transparent: false,
            depthWrite: false,
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
            opacity: opacity
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
            './textures/environmentMap/px.jpg', './textures/environmentMap/nx.jpg',
            './textures/environmentMap/py.jpg', './textures/environmentMap/ny.jpg',
            './textures/environmentMap/pz.jpg', './textures/environmentMap/nz.jpg'
        ]);

        const glassGeometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.8,
            opacity: 0.4,
            transparent: true,
            envMap: envMap,
            envMapIntensity: 0.065
        });
        const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);

        glassMesh.position.copy(cssObject.position);
        glassMesh.rotation.copy(cssObject.rotation);
        glassMesh.scale.copy(cssObject.scale);

        glassMesh.position.z += 40;

        this.scene.add(glassMesh);
    }

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('mousemove', (event) => {
            this._updateMousePositionAndIntersects(event, 'screen:mouseover', 'screen:mouseout');
        });

        window.addEventListener('click', (event) => {
            this._updateMousePositionAndIntersects(event, 'screen:click');
        });
    }

    _updateMousePositionAndIntersects(event, eventType, outEventType = null) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.application.camera.instance);

        const intersects = this.raycaster.intersectObject(this.mesh);

        if (intersects.length > 0) {
            if (eventType === 'screen:click') {
                this.iframe.style.pointerEvents = 'auto';
                this.isIframeActive = true;
                this.cursorMessage.style.display = 'none';
            } else {
                this.eventEmitter.trigger(eventType);
            }
        } else if (outEventType) {
            this.eventEmitter.trigger(outEventType);
            this.isIframeActive = false;
        }
    }

    createCursorMessage() {
        this.cursorMessage = document.createElement('div');
        this.cursorMessage.innerText = "Cliquez pour accéder à l'écran";
        this.cursorMessage.style.position = 'absolute';
        this.cursorMessage.classList.add('cursor-message');

        document.body.style.cursor = 'pointer';

        this.textEffect = new TextEffect(this.cursorMessage, {
            updateInterval: 10,
            effectDuration: 1500
        });

        document.body.appendChild(this.cursorMessage);

        this.eventEmitter.on('screen:mouseover', () => {
            if (!this.isIframeActive && !this.hasEffectStarted) {
                this.cursorMessage.style.display = 'block';
                this.textEffect.startEffect();
                this.hasEffectStarted = true;
                document.body.style.cursor = 'pointer';
            }
            window.addEventListener('mousemove', this.updateCursorMessagePosition.bind(this));
        });

        this.eventEmitter.on('screen:mouseout', () => {
            this.cursorMessage.style.display = 'none';
            this.iframe.style.pointerEvents = 'none';
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', this.updateCursorMessagePosition.bind(this));
            this.textEffect.stopEffect();

            this.hasEffectStarted = false;
        });
    }

    updateCursorMessagePosition(event) {
        this.cursorMessage.style.left = event.clientX + 10 + 'px';
        this.cursorMessage.style.top = event.clientY + 10 + 'px';
    }
}