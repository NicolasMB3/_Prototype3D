import './style.css';
import Application from './Application/Application.js';
import {
    CSS3D_CONTAINER_ID,
    LOADING_CONTAINER_ID,
    SHADER_CONTAINER_ID,
    WEBGL_CONTAINER_ID
} from "./Application/variables.js";

const canvas = document.querySelector(WEBGL_CONTAINER_ID);
const canvas3D = document.querySelector(CSS3D_CONTAINER_ID);
const shader3D = document.querySelector(SHADER_CONTAINER_ID);
const loadingCanvas = document.querySelector(LOADING_CONTAINER_ID);

const app = new Application(canvas, canvas3D, shader3D, loadingCanvas);

// Credits to the author of the 3D model:
// https://sketchfab.com/dr.badass2142