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

import Stats from 'stats.js';
import EventEmitter from "./Utils/EventEmitter.js";

export default class Application extends EventEmitter {
    constructor(canvas, canvas3D, shader) {

        super();

        if(instance) {
            return instance;
        }
        instance = this;

        window.application = this;

        this.canvas = canvas;
        this.canvas3D = canvas3D;
        this.shader = shader;

        // Debug
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

        this.debug = new Debug();
        this.sizes = new Sizes();
        this.clock = new Clock();
        this.scene = new THREE.Scene();
        this.scene3D = new THREE.Scene();
        this.resources = new Resources(sources);
        this.camera = new Camera();
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
    }

    update() {
        this.stats.begin();
        this.camera.update();
        this.world.update();
        this.interactiveObject.update();
        this.renderer.update();
        this.stats.end();
    }
}