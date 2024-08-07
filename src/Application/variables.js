export const IFRAME_WIDTH = 1055;
export const IFRAME_HEIGHT = 920;
export const URL_OS = 'https://nicolasbaar.fr/prototype/';
export const WEBGL_CONTAINER_ID = '#webgl';
export const CSS3D_CONTAINER_ID = '#css3d';
export const SHADER_CONTAINER_ID = '#shader';
export const LOADING_CONTAINER_ID = '#loadingScreen';

export const CAMERA_SETTINGS = {
    fov: 45,
    near: 1,
    far: 10000,
    positions: [
        // Original position
        { x: 800, y: 3055, z: 2910 },
        // Position when looking at the screen
        { x: 835, y: 2955, z: 900 },
        // Positions when looking at StickyNotes
        { x: -950, y: 3450, z: -600 },  // StickyNote 1
        { x: -1225, y: 3525, z: -600 }, // StickyNote 2
        { x: 565, y: 3990, z: -1000 },  // StickyNote 3
        { x: 2485, y: 4175, z: -1000 }, // StickyNote 4
        { x: 2225, y: 3315, z: 400 },   // StickyNote 5
        // Transition position
        { x: 1000, y: 3000, z: 2000 },
        // Paper plane
        { x: -730, y: 3170, z: 125 }
    ],
};