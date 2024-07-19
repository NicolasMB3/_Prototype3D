import * as THREE from 'three';

export default class Baking {
    constructor(model, texture, scale) {
    this.model = model;
    this.texture = texture;

    this.texture.flipY = false;
    this.texture.colorSpace = THREE.SRGBColorSpace

    this.material = new THREE.MeshBasicMaterial({
        map: this.texture,
    });

    this.model.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.map = this.texture;
            child.material = this.material;
        }
        this.model.scene.scale.set(scale, scale, scale);
    });
}

    getModel() {
        return this.model.scene;
    }
}