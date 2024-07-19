import Application from "../Application.js";
import Baking from '../Utils/Baking.js';

export default class Scene {
    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.bakeModel();
        this.setModel();
    }

    bakeModel() {
        const { environmentTexture, environmentModel } = this.resources.items;

        this.bakedModel = new Baking(
            environmentModel,
            environmentTexture,
            1000
        );
    }

    setModel() {
        this.scene.add(this.bakedModel.getModel());
    }
}