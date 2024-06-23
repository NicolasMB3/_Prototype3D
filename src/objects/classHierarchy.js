export class classHierarchy {
    constructor(desktop) {
        this.desktop = desktop;
        this.trash = [];
    }

    onTrashDrop(e) {
        e.preventDefault();
        const folderName = e.dataTransfer.getData('text/plain');
        const folderElement = document.querySelector(`.desktop-folder[data-name="${folderName}"]`);
        if (folderElement && folderElement.dataset.name !== 'Poubelle') {
            this.removeFolderAndWindow(folderElement);
        }
    }

    moveSelectedFoldersToTrash() {
        this.desktop.selectedFolders.forEach(folder => {
            if (folder.dataset.name !== 'Poubelle') {
                this.trash.push(folder);
                folder.remove();
                const [x, y] = this.desktop.getFolderPosition(folder);
                this.desktop.grid[x][y] = 0;
                const windowElement = document.querySelector(`.window[data-name="${folder.dataset.name}"]`);
                if (windowElement) {
                    windowElement.remove();
                }
            }
        });
        this.desktop.selectedFolders = [];
    }

    addRestoreEvent(folderElementInWindow) {
        const restoreEvent = (e) => {
            const contextMenu = this.desktop.createContextMenu(e, folderElementInWindow); // Pass folderElementInWindow here
            contextMenu.querySelector('.restore').addEventListener('click', () => {
                this.trash = this.trash.filter(folder => folder.dataset.name !== folderElementInWindow.dataset.name);
                this.desktop.setFolderPosition(folderElementInWindow);
                folderElementInWindow.setAttribute('draggable', 'true');
                document.querySelector('.windows_area').appendChild(folderElementInWindow);
                contextMenu.remove();
                this.updateTrashWindowContent();
                folderElementInWindow.removeEventListener('contextmenu', restoreEvent);
                this.moveToTrash(folderElementInWindow);
                const restoredWindowContent = this.desktop.content[folderElementInWindow.dataset.name];
                this.desktop.addDoubleClickEvent(folderElementInWindow, folderElementInWindow.dataset.name, restoredWindowContent, 'icon_du_dossier');
                if (folderElementInWindow.closest('.window')) {
                    folderElementInWindow.closest('.window').removeChild(folderElementInWindow);
                }
                this.desktop.addDragEvents(folderElementInWindow, folderElementInWindow.dataset.name);
            });
            document.body.appendChild(contextMenu);
        };
        folderElementInWindow.addEventListener('contextmenu', restoreEvent);
    }

    removeFolderAndWindow(folderElement) {
        this.trash.push(folderElement);
        folderElement.remove();
        const trashUpdatedEvent = new CustomEvent('trashUpdated');
        document.dispatchEvent(trashUpdatedEvent);
        const [x, y] = this.desktop.getFolderPosition(folderElement);
        this.desktop.grid[x][y] = 0;
        const windowElement = document.querySelector(`.window[data-name="${folderElement.dataset.name}"]`);
        if (windowElement) {
            windowElement.remove();
        }
    }

    moveToTrash(folderElement) {
        if (folderElement.dataset.name === 'Poubelle') return;
        folderElement.addEventListener('contextmenu', (e) => {
            const contextMenu = this.desktop.createContextMenu(e, folderElement);
            contextMenu.querySelector('.delete').addEventListener('click', () => {
                this.removeFolderAndWindow(folderElement);
                contextMenu.remove();
            });
            document.body.appendChild(contextMenu);
        });
    }

    emptyBin() {
        this.trash = [];
        this.updateTrashWindowContent();
    }

    updateTrashWindowContent() {
        const trashWindows = document.querySelectorAll('.window[data-name="Poubelle"]');
        if (trashWindows) {
            trashWindows.forEach(trashWindow => {
                trashWindow.querySelector('.content').innerHTML = this.trash.map(folder => {
                    const folderElement = this.desktop.createFolderElement(folder.dataset.name, folder.querySelector('img').src);
                    return folderElement.outerHTML;
                }).join('');
                this.trash.forEach((folder, index) => {
                    const folderElementInWindow = trashWindow.querySelector(`.desktop-folder:nth-child(${index + 1})`);
                    this.addRestoreEvent(folderElementInWindow);
                });
            });
        }
    }
}