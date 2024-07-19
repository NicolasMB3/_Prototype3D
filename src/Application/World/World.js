import Application from '../Application.js';
import Scene from "./Scene.js";
import Monitor from "./Monitor.js";
import EventEmitter from "../Utils/EventEmitter.js";

export default class World extends EventEmitter{
    constructor() {
        super();

        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.resources.on('ready', () => {
            this.scene = new Scene();
            this.monitor = new Monitor();
            this.trigger('monitorReady', [this.monitor]);
        });
    }

    update() {
    }
}
