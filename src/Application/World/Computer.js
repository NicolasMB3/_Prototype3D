import Application from "../Application.js";
import Baking from '../Utils/Baking.js';

export default class Computer {
    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.bakeModel();
        this.setModel();
    }

    bakeModel() {
        const { computerTexture, computerModel } = this.resources.items;

        this.bakedModel = new Baking(
            computerModel,
            computerTexture,
            2000
        );
    }

    setModel() {
        this.scene.add(this.bakedModel.getModel());
    }
}