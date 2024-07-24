import * as THREE from 'three';
import Application from '../Application.js';

import chocolateShaderVertex from '../Shaders/ChocolateSmoke/vertex.glsl';
import chocolateShaderFragment from '../Shaders/ChocolateSmoke/fragment.glsl';

export default class Chocolate {

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.clock = this.application.clock;

        this.textureLoader = new THREE.TextureLoader();

        this.model = {
            geometry: null,
            texture: null,
            material: null,
            mesh: null,
        }

        this.setModel();
    }

    setModel() {
        this.model.geometry = new THREE.PlaneGeometry(100, 100, 16, 64);
        this.model.geometry.translate(0, 0.5, 0);
        this.model.geometry.scale(1.7, 6, 1.7);

        this.model.texture = this.textureLoader.load('./textures/perlin.png');
        this.model.texture.wrapS = THREE.RepeatWrapping;
        this.model.texture.wrapT = THREE.RepeatWrapping;

        this.model.material = new THREE.ShaderMaterial({
            vertexShader: chocolateShaderVertex,
            fragmentShader: chocolateShaderFragment,
            uniforms: {
                uTime: new THREE.Uniform(0),
                uPerlinTexture: new THREE.Uniform(this.model.texture),
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe: false,
        });

        this.model.mesh = new THREE.Mesh(
            this.model.geometry,
            this.model.material
        );

        this.model.mesh.position.copy(new THREE.Vector3(-133, 2700, -950));

        this.scene.add(this.model.mesh);
    }

    update() {
        this.model.material.uniforms.uTime.value = this.clock.elapsed;
    }
}
