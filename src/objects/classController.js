export class WindowController {

    constructor(classWindows, windowElement, icon) {
        // en PX
        this.MIN_WIDTH = 500;
        this.MIN_HEIGHT = 300;

        this.isFullScreen = false;
        this.shiftX = null;
        this.zIndex = 0;
        this.shiftY = null;
        this.activeWindow = null;
        this.isResizingWidth = false;
        this.isResizingHeight = false;
        this.animationFrameId = null;
        this.lastEvent = null;
        this.originalSize = { width: '', height: '', top: '', left: '' };
        this.icon = icon;

        this.classWindows = classWindows;
        this.windowElement = windowElement;
    }

    init(windowElement) {
        const controller = windowElement.querySelector('.controller');
        this.addMinimizeButtonListener(windowElement);
        this.addExpandButtonListener(windowElement);
        this.addCloseButtonListener(windowElement);
        this.addControllerListeners(controller, windowElement);
        this.addWindowElementListeners(controller, windowElement);
        document.addEventListener('mouseup', () => this.onMouseUp());
    }

    addMinimizeButtonListener(windowElement) {
        const minimizeButton = windowElement.querySelector('.minus');
        minimizeButton.addEventListener('dblclick', (e) => e.preventDefault());
        minimizeButton.addEventListener('click', () => this.minimizeWindow(windowElement, this.icon));
    }

    addExpandButtonListener(windowElement) {
        const expandButton = windowElement.querySelector('.expand');
        expandButton.addEventListener('dblclick', (e) => e.preventDefault());
        expandButton.addEventListener('click', () => this.setFullScreen(windowElement));
    }

    addCloseButtonListener(windowElement) {
        const closeButton = windowElement.querySelector('.close');
        closeButton.addEventListener('dblclick', (e) => e.preventDefault());
        closeButton.addEventListener('click', () => this.closeWindow(windowElement));
    }

    addControllerListeners(controller, windowElement) {
        controller.addEventListener('mousedown', (e) => this.onMouseDown(controller, windowElement, e));
        controller.addEventListener('mouseup', () => this.onMouseUp());
        controller.addEventListener('dblclick', () => this.setFullScreen(windowElement));
        controller.addEventListener('mouseleave', () => this.onMouseLeave());
    }

    addWindowElementListeners(controller, windowElement) {
        windowElement.addEventListener('mousemove', (e) => this.onMouseMoveCursor(e, windowElement));
        windowElement.addEventListener('mousedown', (e) => this.onWindowMouseDown(e, controller, windowElement));
    }

    bringToFront(windowElement) {
        windowElement.style.zIndex = (++this.zIndex).toString();
    }

    closeWindow() {
        const snakeCanvasElement = this.windowElement.querySelector('canvas.snake');

        if (snakeCanvasElement) {
            const snakeCanvasId = this.windowElement.querySelector('canvas.snake').id;
            const snakeCanvas = document.getElementById(snakeCanvasId);

            if (snakeCanvas && snakeCanvas.snakeGame) {
                snakeCanvas.snakeGame.stopGame();
            }
        }

        this.windowElement.remove();
    }

    minimizeWindow(windowElement, icon) {
        windowElement.classList.add('minimized');

        setTimeout(() => {
            windowElement.style.display = 'none';
        }, 500);

        const dock = document.querySelector('.dock_content');
        let iconID = dock.querySelector(`.active_dock[data-icon="${icon}"]`);

        if (!iconID) {
            iconID = document.createElement('div');
            iconID.className = 'active_dock';
            iconID.dataset.icon = icon;
            iconID.innerHTML = `<img class="window_dock_folder" src="${icon}" alt="Image de fenêtre">`;

            dock.appendChild(iconID);
        }

        const windowIDs = JSON.parse(iconID.dataset.windows || '[]');
        const oldIcon = iconID.cloneNode(true);

        windowIDs.push(windowElement.id);
        iconID.dataset.windows = JSON.stringify(windowIDs);
        iconID.parentNode.replaceChild(oldIcon, iconID);
        iconID = oldIcon;

        if (windowIDs.length === 1) {
            iconID.addEventListener('click', () => {
                this.restoreWindow(windowElement, iconID);
            });
        } else {
            iconID.addEventListener('click', () => {
                const menu = iconID.querySelector('.window-menu');
                if (menu) {
                    menu.remove();
                } else {
                    this.showWindowMenu(iconID);
                }
            });
        }
    }

    showWindowMenu(iconID) {
        const windowIDs = JSON.parse(iconID.dataset.windows || '[]');
        const menu = document.createElement('div');
        menu.className = 'window-menu';

        menu.innerHTML = '';
        windowIDs.forEach(id => {
            const menuItem = document.createElement('div');
            menuItem.textContent = id;
            menuItem.addEventListener('click', () => {
                this.restoreWindow(document.getElementById(id), iconID);
                const menu = iconID.querySelector('.window-menu');
                if (menu) {
                    menu.remove();
                }
            });
            menu.appendChild(menuItem);
        });

        iconID.appendChild(menu);
    }

    restoreWindow(windowElement, iconID) {
        windowElement.classList.remove('minimized');
        windowElement.style.display = 'block';

        const windowIDs = JSON.parse(iconID.dataset.windows || '[]');
        iconID.dataset.windows = JSON.stringify(windowIDs.filter(id => id !== windowElement.id));

        if (windowIDs.length <= 1) {
            iconID.remove();
        } else {
            const menu = iconID.querySelector('.window-menu');
            if (menu) {
                menu.remove();
            }
        }
    }

    #getMouseAndWindowSize(e, windowElement) {
        const rect = windowElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const windowWidth = rect.width;
        const windowHeight = rect.height;

        return { mouseX, mouseY, windowWidth, windowHeight };
    }

    setFullScreen(windowElement) {
        const navigationHeight = document.querySelector('.navigation').offsetHeight;

        if (!this.isFullScreen) {
            this.originalSize = {
                width: windowElement.style.width,
                height: windowElement.style.height,
                top: windowElement.style.top,
                left: windowElement.style.left
            };

            this.bringToFront(windowElement)
            windowElement.style.top = navigationHeight + 'px';
            windowElement.style.left = '0px';
            windowElement.style.width = window.innerWidth + 'px';
            windowElement.style.height = windowElement.parentElement.clientHeight + 'px';
            windowElement.classList.add('fullScreen');
            this.isFullScreen = true;
        } else {
            windowElement.style.width = this.originalSize.width;
            windowElement.style.height = this.originalSize.height;
            windowElement.style.top = this.originalSize.top;
            windowElement.style.left = this.originalSize.left;
            windowElement.classList.add('fullScreen');
            this.isFullScreen = false;
        }

        requestAnimationFrame(() => {
            const snakeCanvas = windowElement.querySelector('#snake');
            if (snakeCanvas) {
                snakeCanvas.width = windowElement.offsetWidth;
                snakeCanvas.height = windowElement.offsetHeight - windowElement.querySelector('.controller').offsetHeight;

                const snakeGame = snakeCanvas.snakeGame;
                if (snakeGame && !snakeGame.gameOver) {
                    snakeGame.apple.left = Math.min(snakeGame.apple.left, snakeCanvas.width - 10);
                    snakeGame.apple.top = Math.min(snakeGame.apple.top, snakeCanvas.height - 10);

                    snakeGame.snake = snakeGame.snake.map(part => ({
                        left: Math.min(part.left, snakeCanvas.width - 10),
                        top: Math.min(part.top, snakeCanvas.height - 10)
                    }));
                }
            }
        });

        windowElement.classList.remove('fullScreen');

        windowElement.addEventListener('transitionend', () => {
            windowElement.classList.remove('fullScreen');
        });
    }

    resizeWidth(e) {
        const parent = this.activeWindow.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const rect = this.activeWindow.getBoundingClientRect();
        const newWidth = e.pageX - rect.left;
        const maxWidth = parentRect.width - rect.left;
        this.activeWindow.style.width = Math.min(Math.max(newWidth, this.MIN_WIDTH), maxWidth) + 'px';
        this.classWindows.bringToFront(this);

        const snakeCanvas = this.activeWindow.querySelector('#snake');
        if (snakeCanvas) {
            snakeCanvas.width = newWidth;
        }
    }

    resizeHeight(e) {
        const parent = this.activeWindow.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const rect = this.activeWindow.getBoundingClientRect();
        const newHeight = e.pageY - rect.top;
        const maxHeight = parentRect.height - rect.top;
        this.activeWindow.style.height = Math.min(Math.max(newHeight, this.MIN_HEIGHT), maxHeight) + 'px';
        this.classWindows.bringToFront(this);

        const snakeCanvas = this.activeWindow.querySelector('#snake');
        if (snakeCanvas) {
            snakeCanvas.height = newHeight;
        }
    }

    move() {
        if (this.activeWindow && !this.isResizingWidth && !this.isResizingHeight && this.lastEvent) {
            const parent = this.activeWindow.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const navigationHeight = document.querySelector('.navigation').offsetHeight;
            const newLeft = this.lastEvent.pageX - this.shiftX;
            const newTop = this.lastEvent.pageY - this.shiftY;
            const newRight = newLeft + this.activeWindow.offsetWidth;
            const newBottom = newTop + this.activeWindow.offsetHeight;

            if (newLeft >= 0 && newRight <= parentRect.width) {
                this.activeWindow.style.left = newLeft + 'px';
            } else if (newLeft < 0) {
                this.activeWindow.style.left = '0px';
            } else if (newRight > parentRect.width) {
                this.activeWindow.style.left = (parentRect.width - this.activeWindow.offsetWidth) + 'px';
            }

            if (newTop >= navigationHeight && newBottom <= (parentRect.height + navigationHeight)) {
                this.activeWindow.style.top = newTop + 'px';
            } else if (newTop < navigationHeight) {
                this.activeWindow.style.top = navigationHeight + 'px';
            } else if (newBottom > (parentRect.height + navigationHeight)) {
                this.activeWindow.style.top = (parentRect.height + navigationHeight - this.activeWindow.offsetHeight) + 'px';
            }
        }
    }

    onMouseUp() {
        this.activeWindow = null;
        this.isResizingWidth = false;
        this.isResizingHeight = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    onMouseMove(e) {
        this.lastEvent = e;
        if (this.activeWindow && !this.isResizingWidth && !this.isResizingHeight) {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.animationFrameId = requestAnimationFrame(() => this.move());
        }
    }

    onResizeMove(e) {
        if (this.isResizingWidth) {
            this.resizeWidth(e);
        } else if (this.isResizingHeight) {
            this.resizeHeight(e);
        }
    }

    handleMouseDown(e, controller, windowElement) {
        const { mouseX, mouseY, windowWidth, windowHeight } = this.#getMouseAndWindowSize(e, windowElement);

        this.shiftX = mouseX;
        this.shiftY = mouseY;

        if (mouseX > windowWidth * 0.98) {
            this.isResizingWidth = true;
            this.isResizingHeight = false;
        } else if (mouseY > windowHeight * 0.98) {
            this.isResizingWidth = false;
            this.isResizingHeight = true;
        } else if (e.target === controller) {
            windowElement.style.position = 'absolute';
            this.bringToFront(windowElement);
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        }

        this.activeWindow = windowElement;

        document.addEventListener('mousemove', (e) => this.onResizeMove(e));
    }

    onMouseDown(controller, windowElement, e) {
        this.handleMouseDown(e, controller, windowElement);
        this.classWindows.bringToFront(this);
    }

    onWindowMouseDown(e, controller, windowElement) {
        const { mouseX, mouseY, windowWidth, windowHeight } = this.#getMouseAndWindowSize(e, windowElement);

        if (mouseX > windowWidth * 0.98 || mouseY > windowHeight * 0.98) {
            this.isResizingWidth = mouseX > windowWidth * 0.98;
            this.isResizingHeight = mouseY > windowHeight * 0.98;
            this.activeWindow = windowElement;
            document.addEventListener('mousemove', (e) => this.onResizeMove(e));
        } else if (e.target === controller) {
            this.handleMouseDown(e, controller, windowElement);
        }
    }

    onMouseMoveCursor(e, windowElement) {
        const { mouseX, mouseY, windowWidth, windowHeight } = this.#getMouseAndWindowSize(e, windowElement);

        if (mouseX > windowWidth * 0.98) {
            document.body.style.cursor = 'ew-resize';
        } else if (mouseY > windowHeight * 0.98) {
            document.body.style.cursor = 'ns-resize';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    onMouseLeave() {
        document.body.style.cursor = 'default';
    }
}