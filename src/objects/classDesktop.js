/* global document, Node, window */

import { Snake } from "./classSnake.js";
import { classHierarchy } from "./classHierarchy.js";

export class Desktop {

    constructor(windows) {
        this.windows = windows;
        this.selectedFolders = [];
        this.originalPositions = {};
        this.content = {};
        this.isSelecting = false;
        this.selectionBox = null;
        this.grid = this.createGrid();
        this.startX = 0;
        this.startY = 0;
        this.iconSize = 40;
        this.draggedFolderName = null;
        this.windowsArea = document.querySelector('.windows_area');
        this.navigation = document.querySelector('.navigation');
        this.hierarchy = new classHierarchy(this);
        this.setLocalStorageKeys();
        this.init();
    }

    init() {
        this.windowsArea.addEventListener('mousedown', (e) => {
            this.removeSelection(e);
            this.startSelection(e);
        });
        this.windowsArea.addEventListener('mousemove', (e) => this.updateSelection(e));
        this.windowsArea.addEventListener('mouseup', (e) => this.endSelection(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        this.launchSnakeOnWindowOpen();
        this.setupDragAndDrop();
    }

    setLocalStorageKeys() {
        const keys = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        };
        localStorage.setItem('keys', JSON.stringify(keys));
    }

    createGrid() {
        const gridSize = 5;
        return Array(gridSize).fill(undefined, undefined, undefined).map(() => Array(gridSize).fill(0));
    }

    setIconSize(size) {
        this.iconSize = size;
    }

    updateIconSize() {
        const folderIcons = document.querySelectorAll('.desktop-folder img');
        folderIcons.forEach(icon => {
            icon.style.width = `${this.iconSize}px`;
            icon.style.height = `${this.iconSize}px`;
        });
    }

    handleKeyDown(e) {
        if (e.key === 'Delete') {
            this.hierarchy.moveSelectedFoldersToTrash();
        }
    }

    createLN(folderName, contentFunction, icon, type) {
        const folderElement = this.createFolderElement(folderName, icon, type);
        this.setFolderPosition(folderElement);
        this.addDragEvents(folderElement, folderName);
        this.content[folderName] = contentFunction;
        if (folderName === 'Poubelle') {
            this.addDoubleClickEventTrash(folderElement, folderName, contentFunction, icon);
            this.addContextMenuEvent(folderElement);
            folderElement.addEventListener('drop', (e) => this.hierarchy.onTrashDrop(e));
            document.addEventListener('trashUpdated', () => {
                this.hierarchy.updateTrashWindowContent();
            });
        } else {
            this.addDoubleClickEvent(folderElement, folderName, contentFunction, icon);
        }
        document.querySelector('.windows_area').appendChild(folderElement);
        this.hierarchy.moveToTrash(folderElement);
    }

    addContextMenuEvent(element) {
        element.addEventListener('contextmenu', (e) => {
            this.createContextMenu(e, element); // pass element here
        });
    }

    addDoubleClickEventTrash(folderElement, folderName, content, icon) {
        folderElement.addEventListener('dblclick', () => {
            const trashContent = this.hierarchy.trash.map(folder => {
                const folderElement = this.createFolderElement(folder.dataset.name, folder.querySelector('img').src);
                return folderElement.outerHTML;
            }).join('');
            const trashWindow = this.windows.createNewWindow("center", icon, folderName, trashContent);
            this.hierarchy.trash.forEach((folder, index) => {
                const folderElementInWindow = trashWindow.querySelector(`.desktop-folder:nth-child(${index + 1})`);
                this.hierarchy.addRestoreEvent(folderElementInWindow);
            });
        });
    }

    updateGrid(folderElement) {
        const folderName = folderElement.dataset.name;
        const oldPosition = this.getFolderPosition(folderElement);

        if (oldPosition) {
            const [oldX, oldY] = oldPosition;
            this.grid[oldX][oldY] = 0;
        }

        const folderRect = folderElement.getBoundingClientRect();
        const gridSize = 135;
        const gap = 10;
        const navigationHeight = document.querySelector('.navigation').offsetHeight;

        const newX = Math.floor(folderRect.left / (gridSize + gap));
        const newY = Math.floor((folderRect.top - navigationHeight) / (gridSize + gap));

        if (newX >= 0 && newX < this.grid.length && newY >= 0 && newY < this.grid[newX].length) this.grid[newX][newY] = folderName;
    }

    launchSnake() {
        const snakeCanvas = document.createElement('canvas');
        snakeCanvas.id = 'snake';
        snakeCanvas.classList.add('snake');
        return snakeCanvas.outerHTML;
    }

    launchSnakeOnWindowOpen() {
        const windowsArea = document.querySelector('.windows_area');
        let snakeGameCounter = 0;
        windowsArea.addEventListener('DOMNodeInserted', (event) => {
            const newWindow = event.target;
            if (newWindow.nodeType === Node.ELEMENT_NODE && newWindow.classList.contains('window') && newWindow.dataset.name === 'Snake') {
                const snakeCanvas = newWindow.querySelector('#snake');
                if (snakeCanvas) {
                    snakeGameCounter++;
                    snakeCanvas.id = `snake-${snakeGameCounter}`;
                    snakeCanvas.width = newWindow.offsetWidth;
                    snakeCanvas.height = newWindow.offsetHeight - newWindow.querySelector('.controller').offsetHeight;
                    if (snakeCanvas.getContext) {
                        const snakeGame = new Snake(snakeCanvas.id);
                        snakeGame.init();
                        snakeCanvas.snakeGame = snakeGame;
                    }
                }
            }
        });
    }

    createContextMenu(e, folderElement) {
        e.preventDefault();

        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const contextMenu = document.createElement('div');
        contextMenu.style.position = 'absolute';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.classList.add('context-menu');

        // Check if the folderElement is the trash
        if (folderElement.dataset.name === 'Poubelle') {
            contextMenu.innerHTML = '<button class="empty-trash">Vider la corbeille</button>';
            contextMenu.querySelector('.empty-trash').addEventListener('click', () => {
                this.hierarchy.emptyBin();
                contextMenu.remove();
            });
        } else {
            contextMenu.innerHTML = '<button class="delete">Supprimer</button><button class="restore">Restaurer</button>';
        }

        document.body.appendChild(contextMenu);

        // Add event listener to remove context menu when clicking elsewhere
        document.addEventListener('mousedown', function removeContextMenu(event) {
            if (!event.target.closest('.context-menu')) {
                contextMenu.remove();
                document.removeEventListener('mousedown', removeContextMenu);
            }
        });

        // Return the contextMenu element
        return contextMenu;
    }

    createFolderElement(folderName, icon, type) {
        const folderElement = document.createElement('div');
        const folderIcon = document.createElement('img');
        const folderTitle = document.createElement('div');

        folderElement.classList.add('desktop-folder', 'block_highlights');
        folderElement.dataset.name = folderName;
        folderElement.dataset.type = type;
        folderElement.childrenFolders = {};

        folderIcon.src = icon;
        folderIcon.alt = folderName;
        folderIcon.style.width = `${this.iconSize}px`;
        folderIcon.style.height = `${this.iconSize}px`;
        folderElement.appendChild(folderIcon);

        folderTitle.textContent = folderName;
        folderElement.appendChild(folderTitle);

        return folderElement;
    }

    setFolderPosition(folderElement) {
        const freePosition = this.findFreePosition();
        if (freePosition) {
            const [x, y] = freePosition;
            this.grid[x][y] = folderElement.dataset.name;

            const gridSize = 135;
            const gap = 10;
            const gridY = y * (gridSize + gap) + document.querySelector('.navigation').offsetHeight;
            const gridX = x * (gridSize + gap);

            folderElement.style.position = 'absolute';
            folderElement.style.left = `${gridX}px`;
            folderElement.style.top = `${gridY}px`;
        } else {
            console.error('Aucune position de disponible sur le bureau.');
        }
    }

    getFolderPosition(folderElement) {
        const folderName = folderElement.dataset.name;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] === folderName) {
                    return [i, j];
                }
            }
        }

        return null;
    }

    findFreePosition() {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (this.grid[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    addDragEvents(folderElement, folderName) {

        folderElement.draggable = true;

        if (folderElement.closest('.window')) return;

        const folderIcon = folderElement.querySelector('img');
        folderIcon.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        folderElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', folderName);
            this.draggedFolderName = folderName;
            folderElement.classList.add('dragging');
            this.draggedFolder = folderElement;

            if (!folderElement.classList.contains('selected')) {
                this.selectedFolders.forEach(folder => {
                    folder.classList.remove('selected');
                });
                this.selectedFolders = [];
            }

            this.previewElement = folderElement.cloneNode(true);
            this.previewElement.classList.add('folder-preview');
            this.previewElement.style.position = 'absolute';
            document.querySelector('.windows_area').appendChild(this.previewElement);
        });

        folderElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (folderElement.dataset.type === 'folder' || folderElement.dataset.type === 'game') {
                folderElement.classList.add('over');
            }
        });

        folderElement.addEventListener('dragleave', () => {
            folderElement.classList.remove('over');
        });

        folderElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const childFolderName = e.dataTransfer.getData('text/plain');
            const childFolderElement = document.querySelector(`.desktop-folder[data-name="${childFolderName}"]`);

            if (folderName === childFolderName) {
                folderElement.classList.remove('over');
                return;
            }

            if ((folderElement.dataset.type === 'folder' || folderElement.dataset.type === 'game') && (childFolderElement.dataset.type !== 'system' || childFolderName === 'Snake')) {
                folderElement.childrenFolders[childFolderName] = childFolderElement;
                childFolderElement.style.display = 'none';
            }
            folderElement.classList.remove('over');
        });

        folderElement.addEventListener('dragend', () => {
            folderElement.classList.remove('dragging');
            this.updateGrid(folderElement);
            if (this.previewElement) {
                this.previewElement.remove();
                this.previewElement = null;
            }
        });
    }

    setupDragAndDrop() {
        const desktopArea = document.querySelector('.windows_area');

        desktopArea.addEventListener('dragover', (e) => {
            e.preventDefault();

            const folderName = this.draggedFolderName;
            const folderElement = document.querySelector(`.desktop-folder[data-name="${folderName}"]`);

            if (!folderElement || folderElement.closest('.window')) {
                return;
            }

            if (!this.previewElement) {
                this.previewElement = folderElement.cloneNode(true);
                this.previewElement.classList.add('folder-preview');
                this.previewElement.style.position = 'absolute';
                desktopArea.appendChild(this.previewElement);
            }

            const gridSize = 135;
            const gap = 10;

            let gridX = Math.floor(e.clientX / (gridSize + gap)) * (gridSize + gap);
            let gridY = Math.floor(e.clientY / (gridSize + gap)) * (gridSize + gap);

            const desktopAreaRect = desktopArea.getBoundingClientRect();

            gridX = Math.min(Math.max(gridX, 0), desktopAreaRect.width - gridSize);
            gridY = Math.min(Math.max(gridY, 0), desktopAreaRect.height - gridSize);

            gridY += document.querySelector('.navigation').offsetHeight;

            if (this.selectedFolders.length > 1) {
                const deltaX = gridX - parseInt(this.draggedFolder.style.left);
                const deltaY = gridY - parseInt(this.draggedFolder.style.top);

                this.selectedFolders.forEach(folder => {
                    folder.style.left = `${parseInt(folder.style.left) + deltaX}px`;
                    folder.style.top = `${parseInt(folder.style.top) + deltaY}px`;
                });
            } else {
                folderElement.style.left = `${gridX}px`;
                folderElement.style.top = `${gridY}px`;
            }

            this.previewElement.style.left = `${gridX}px`;
            this.previewElement.style.top = `${gridY}px`;
        });

        desktopArea.addEventListener('drop', (e) => {
            e.preventDefault();

            const folderName = this.draggedFolderName;
            const folderElement = document.querySelector(`.desktop-folder[data-name="${folderName}"]`);

            if (folderElement) {
                this.selectedFolders.forEach(folder => {
                    // Check if the folder is outside the .windows_area
                    const folderRect = folder.getBoundingClientRect();
                    const desktopAreaRect = desktopArea.getBoundingClientRect();
                    if (folderRect.left < desktopAreaRect.left || folderRect.right > desktopAreaRect.right || folderRect.top < desktopAreaRect.top || folderRect.bottom > desktopAreaRect.bottom) {
                        // Find the nearest available grid position
                        const freePosition = this.findFreePosition();
                        if (freePosition) {
                            const [x, y] = freePosition;
                            this.grid[x][y] = folder.dataset.name;

                            const gridSize = 135;
                            const gap = 10;
                            const gridY = y * (gridSize + gap) + document.querySelector('.navigation').offsetHeight;
                            const gridX = x * (gridSize + gap);

                            folder.style.left = `${gridX}px`;
                            folder.style.top = `${gridY}px`;
                        }
                    }
                    this.updateGrid(folder);
                });
                this.draggedFolderName = null;
                if (this.previewElement) {
                    this.previewElement.remove();
                    this.previewElement = null;
                }
                this.draggedFolder = null;
            }
        });
    }

    addDoubleClickEvent(folderElement, folderName, contentFunction, icon) {
        folderElement.addEventListener('dblclick', () => {
            folderElement.childrenFolders = folderElement.childrenFolders || {};
            if (folderElement.dataset.type === 'folder' || folderElement.dataset.type === 'game') {
                const childFolders = Object.values(folderElement.childrenFolders);
                if (childFolders.length > 0) {
                    let folderContent = '';
                    childFolders.forEach(childFolder => {
                        const childFolderElement = this.createFolderElement(childFolder.dataset.name, childFolder.querySelector('img').src, childFolder.dataset.type);
                        folderContent += childFolderElement.outerHTML;
                    });
                    const childWindow = this.windows.createNewWindow("center", icon, folderName, folderContent);
                    childFolders.forEach((childFolder, index) => {
                        const childFolderElementInWindow = childWindow.querySelector(`.desktop-folder:nth-child(${index + 1})`);
                        this.addDoubleClickEvent(childFolderElementInWindow, childFolderElementInWindow.dataset.name, this.content[childFolderElementInWindow.dataset.name], 'icon_du_dossier');
                    });
                } else {
                    let content;
                    if (typeof contentFunction === 'function') {
                        content = contentFunction();
                    } else {
                        content = contentFunction;
                    }
                    this.windows.createNewWindow("center", icon, folderName, content);
                }
            } else {
                let content;
                if (typeof contentFunction === 'function') {
                    content = contentFunction();
                } else {
                    content = contentFunction;
                }
                this.windows.createNewWindow("center", icon, folderName, content);
            }
        });
    }

    startSelection(e) {

        if (e.target.closest('.desktop-folder')) return;
        if (e.button !== 0) return;

        const navigationHeight = document.querySelector('.navigation').offsetHeight;
        const dockHeight = document.querySelector('.dock').offsetHeight;
        const maxY = window.innerHeight - dockHeight;

        if (e.clientY < navigationHeight || e.clientY > maxY) return;

        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
        if (elementUnderCursor.closest('.window') || elementUnderCursor.closest('.window-menu')) return;

        this.isSelecting = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        this.selectionBox = document.createElement('div');
        this.selectionBox.style.position = 'absolute';
        this.selectionBox.style.left = `${this.startX}px`;
        this.selectionBox.style.top = `${this.startY}px`;
        this.selectionBox.style.border = '1px solid rgba(12, 36, 97,1.0)';
        this.selectionBox.style.background = 'rgba(74, 105, 189,0.3)';
        this.selectionBox.style.pointerEvents = 'none'

        const windows = document.querySelectorAll('.window');
        windows.forEach(window => window.classList.add('no-select'));

        document.body.appendChild(this.selectionBox);
    }

    updateSelection(e) {
        if (!this.isSelecting) return;

        const dockHeight = document.querySelector('.dock').offsetHeight;
        const maxY = window.innerHeight - dockHeight;

        const currentY = Math.min(Math.max(e.clientY, this.navigation.offsetHeight), maxY);
        const currentX = e.clientX;

        const newWidth = Math.abs(currentX - this.startX);
        const newHeight = Math.abs(currentY - this.startY);
        const newLeft = Math.min(currentX, this.startX);
        const newTop = Math.min(currentY, this.startY);

        this.selectionBox.style.width = `${newWidth}px`;
        this.selectionBox.style.height = `${newHeight}px`;
        this.selectionBox.style.left = `${newLeft}px`;
        this.selectionBox.style.top = `${newTop}px`;

        const folders = document.querySelectorAll('.desktop-folder');
        folders.forEach(folder => {
            const folderRect = folder.getBoundingClientRect();
            const overlaps = !(folderRect.right < this.selectionBox.offsetLeft ||
                folderRect.left > this.selectionBox.offsetLeft + this.selectionBox.offsetWidth ||
                folderRect.bottom < this.selectionBox.offsetTop ||
                folderRect.top > this.selectionBox.offsetTop + this.selectionBox.offsetHeight);

            if (overlaps) {
                if (!this.selectedFolders.includes(folder)) {
                    folder.classList.add('selected');
                    this.selectedFolders.push(folder);
                    this.originalPositions[folder.dataset.name] = { left: folder.style.left, top: folder.style.top };
                }
            } else {
                folder.classList.remove('selected');
                this.selectedFolders = this.selectedFolders.filter(selectedFolder => selectedFolder !== folder);
                delete this.originalPositions[folder.dataset.name];
            }
        });
    }

    removeSelection(e) {
        if (!e.target.closest('.desktop-folder')) {
            this.selectedFolders.forEach(folder => {
                folder.classList.remove('selected');
            });
            this.selectedFolders = [];
        }
    }

    endSelection() {
        if (!this.isSelecting) return;

        const windows = document.querySelectorAll('.window');
        windows.forEach(window => window.classList.remove('no-select'));

        this.isSelecting = false;
        document.body.removeChild(this.selectionBox);
        this.selectionBox = null;
    }
}