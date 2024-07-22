export const IFRAME_WIDTH = 1055;
export const IFRAME_HEIGHT = 925;
export const URL_OS = 'https://floralwhite-cattle-984252.hostingersite.com/prototype/';
export const WEBGL_CONTAINER_ID = '#webgl';
export const CSS3D_CONTAINER_ID = '#css3d';

export const CAMERA_SETTINGS = {
    fov: 45,
    near: 1,
    far: 10000,
    positions: [
        // Original position
        { x: 800, y: 2865, z: 3279 },
        // Position when looking at the screen
        { x: 835, y: 2940, z: 1550 },
        // Positions when looking at StickyNotes (add one for each note)
        { x: -950, y: 3450, z: -1000 }, // StickyNote 1
        { x: -1225, y: 3525, z: -1000 }, // StickyNote 2
        { x: 565, y: 3990, z: -1000 }, // StickyNote 3
        { x: 2485, y: 4175, z: -1000 }, // StickyNote 4
        { x: 2225, y: 3315, z: 400 } // StickyNote 5
    ],
};