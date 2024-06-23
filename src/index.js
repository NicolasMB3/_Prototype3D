import { ClassWindows } from "./objects/classWindows.js";
import { Desktop } from "./objects/classDesktop.js";
import { ClassNavigation } from "./objects/classNavigation.js";
import { Snake } from "./objects/classSnake.js";
import { classHierarchy } from "./objects/classHierarchy.js";

import { params } from "./contents/params/params.js";

const windows = new ClassWindows();
const desktop = new Desktop(windows);
const hierarchy = new classHierarchy(desktop);

const ICON_SIZE = 50;
const CENTER_POSITION = "center";

const windowDockButton = document.querySelector('.window_dock');
const paramsDockButton = document.querySelector('.params_dock');
const trashDockButton = document.querySelector('.trash_dock');
const snakeDockButton = document.querySelector('.snake_dock');

new ClassNavigation();

windowDockButton.addEventListener('click', () => {
    windows.createNewWindow(CENTER_POSITION, "/folder-open.svg", 'test', '<h1>Ma fenêtre</h1>');
});

paramsDockButton.addEventListener('click', () => {
    const newWindow = windows.createNewWindow(CENTER_POSITION, "/hammer.svg", 'Paramètres', params);
    windows.addBackgroundChangeHandler(newWindow);
});

trashDockButton.addEventListener('click', () => {
    const trashContent = hierarchy.trash.map(folder => {
        const folderElement = desktop.createFolderElement(folder.dataset.name, folder.querySelector('img').src);
        return folderElement.outerHTML;
    }).join('');

    const trashWindow = windows.createNewWindow(CENTER_POSITION, "/dumpster.svg", 'Poubelle', trashContent);

    hierarchy.trash.forEach((folder, index) => {
        const folderElementInWindow = trashWindow.querySelector(`.desktop-folder:nth-child(${index + 1})`);
        hierarchy.addRestoreEvent(folderElementInWindow);
    });

    document.addEventListener('trashUpdated', () => {
        hierarchy.updateTrashWindowContent();
    });
});

snakeDockButton.addEventListener('click', () => {
    windows.createNewWindow(CENTER_POSITION, "/gamepad.svg", 'Snake', desktop.launchSnake);
});

desktop.createLN('Mes dossiers', "", "/folder-open.svg", "folder");
desktop.createLN('Mon Dossier 2', "test", "/folder-open.svg", "folder");
desktop.createLN('Paramètres POS', params, "/hammer.svg", "system");
desktop.createLN('Poubelle', '', "/dumpster.svg", "system");
desktop.createLN('Snake', desktop.launchSnake, "/gamepad.svg", "game");

desktop.setIconSize(ICON_SIZE);
desktop.updateIconSize();