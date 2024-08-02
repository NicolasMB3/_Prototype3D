import * as THREE from 'three';

import sources from './sources.js';

import Sizes from "./Utils/Sizes.js";
import Clock from "./Utils/Clock.js";
import Camera from './Camera.js';
import Resources from './Utils/Resources.js';
import Renderer from './Renderer.js';
import World from './World/World.js';
import Debug from "./Utils/Debug.js";
import InteractiveObject from "./Utils/InteractiveObject.js";

let instance = null;

import EventEmitter from "./Utils/EventEmitter.js";
import LoadingScreen from "./LoadingScreen.js";

export default class Application extends EventEmitter {
    constructor(canvas, canvas3D, shader, loadingCanvas) {
        super();

        if(instance) {
            return instance;
        }
        instance = this;

        window.application = this;

        this.canvas = canvas;
        this.canvas3D = canvas3D;
        this.shader = shader;
        this.loadingCanvas = loadingCanvas;

        this.debug = new Debug();
        this.sizes = new Sizes();
        this.clock = new Clock();
        this.scene = new THREE.Scene();
        this.scene3D = new THREE.Scene();

        this.camera = new Camera();

        this.loadingScreen = new LoadingScreen();
        this.loadingScreen.loadingEnd = undefined;
        this.resources = new Resources(sources, this.loadingScreen.getLoadingManager());

        this.renderer = new Renderer(canvas, canvas3D);
        this.world = new World();
        this.interactiveObject = new InteractiveObject(this);

        this.eventListenersScreen();

        this.sizes.on('resize', () => { this.resize(); });
        this.clock.on('tick', () => { this.update(); });
    }

    eventListenersScreen() {
        this.world.on('monitorReady', (monitor) => {
            this.monitor = monitor;
            this.monitor.on('screen:mouseover', () => {
                this.canvas.style.pointerEvents = 'none';
            });

            this.monitor.on('screen:mouseout', () => {
                this.canvas.style.pointerEvents = 'auto';
            });
        });
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
        this.loadingScreen.resize();
    }

    update() {
        this.camera.update();
        this.world.update();
        this.interactiveObject.update();
        this.renderer.update();
        this.loadingScreen.update();
    }
}