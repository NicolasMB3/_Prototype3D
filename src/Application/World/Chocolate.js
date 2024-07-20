import * as THREE from 'three';
import Application from '../Application.js';

import { chocolateShader } from '../Shaders/ChocolateShader.js';

export default class Chocolate {

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.clock = this.application.clock;

        this.model = {};
        this.setModel();
    }

    setModel() {
        this.model.material = new THREE.ShaderMaterial({
            vertexShader: chocolateShader.vertexShader,
            fragmentShader: chocolateShader.fragmentShader,
            uniforms: THREE.UniformsUtils.clone(chocolateShader.uniforms),
            transparent: true,
            depthWrite: false,
        });

        this.model.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(160, 700),
            this.model.material
        );

        this.model.mesh.position.copy(new THREE.Vector3(-135, 2700, -950));

        this.scene.add(this.model.mesh);
    }

    update() {
        this.model.material.uniforms.uTime.value = this.clock.elapsed;
    }
}
