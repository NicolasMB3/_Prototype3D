import { WindowController } from './classController.js';
import { params1 } from '../contents/params/params1.js';
import { params2 } from '../contents/params/params2.js';
import { params4 } from "../contents/params/params4.js";
import { KEY_SYMBOLS } from '../contents/key_symbols.js';

export class ClassWindows {
    constructor() {
        this.windows = [];
        this.highestZIndex = 0;
        this.contentParams = {
            'param1': params1('test'),
            'param2': params2('test 2'),
            'param4': params4('test 2')
        };
    }

    addWindow(windowController) {
        this.windows.push(windowController);
    }

    createWindowElement(position, icon, title, content) {
        return `
            <div class="window position-${ position } ${title === 'Snake' ? 'snake-window' : ''}" data-name="${ title }" style="--random-color: ${this.getRandomColor()}">
                <div class="controller block_highlights">
                    <p>${ title }</p>
                    <div class="icon_controller">
                        <span class="minus"></span>
                        <span class="expand"></span>
                        <span class="close"></span>
                    </div>
                </div>
                <div class="content">
                    ${ content }
                </div>
            </div>
        `;
    }

    getRandomColor() {
        let color = Math.floor(Math.random()*16777215).toString(16);
        while (color.length < 6) {
            color = '0' + color;
        }
        return '#' + color;
    }

    createNewWindow(position, icon, title, contentFunction) {
        const content = typeof contentFunction === 'function' ? contentFunction() : contentFunction;
        const windowsElement = this.createWindowElement(position, icon, title, content);

        document.querySelector('.windows_area').insertAdjacentHTML('beforeend', windowsElement);
        const newWindowElement = document.querySelector('.windows_area').lastElementChild;
        const newWindowController = new WindowController(this, newWindowElement, icon);
        this.addWindow(newWindowController);

        newWindowElement.id = `window-${Date.now()}`;
        newWindowController.init(newWindowElement);

        this.bringToFront(newWindowController);
        this.addNavigationClickHandler(newWindowElement);
        return newWindowElement;
    }

    addNavigationClickHandler(newWindowElement) {
        const navItems = newWindowElement.querySelector('.param_nav');
        const contentContainer = newWindowElement.querySelector('.param_content');

        if (navItems) {
            navItems.addEventListener('click', (e) => {
                if(e.target.tagName === 'LI') {
                    const id = e.target.getAttribute('id');
                    contentContainer.innerHTML = this.contentParams[id] || '';
                    this.addBackgroundChangeHandler(newWindowElement);

                    const snakeColorInput = newWindowElement.querySelector('#snake-color');
                    if (snakeColorInput) {
                        snakeColorInput.addEventListener('change', (e) => {
                            this.changeSnakeColor(e.target.value);
                        });
                    }

                    const keyInputs = newWindowElement.querySelectorAll('.key-input');
                    keyInputs.forEach(input => {
                        input.addEventListener('keydown', (e) => {
                            e.preventDefault();
                            const newKey = e.key;
                            input.textContent = KEY_SYMBOLS[newKey] || newKey;

                            const newKeys = {
                                up: newWindowElement.querySelector('#up-key').textContent === '↑' ? 'ArrowUp' : newWindowElement.querySelector('#up-key').textContent,
                                down: newWindowElement.querySelector('#down-key').textContent === '↓' ? 'ArrowDown' : newWindowElement.querySelector('#down-key').textContent,
                                left: newWindowElement.querySelector('#left-key').textContent === '←' ? 'ArrowLeft' : newWindowElement.querySelector('#left-key').textContent,
                                right: newWindowElement.querySelector('#right-key').textContent === '→' ? 'ArrowRight' : newWindowElement.querySelector('#right-key').textContent
                            };
                            this.changeKeySnake(newKeys);
                        });
                    });
                }
            });
        }
    }

    changeSnakeColor(newColor) {
        localStorage.setItem('snakeColor', newColor);
    }

    changeBackground(theme) {
        document.body.style.backgroundImage = `url('/${theme}.png')`;
    }

    changeKeySnake(newKeys) {
        localStorage.setItem('keys', JSON.stringify(newKeys));
    }

    addBackgroundChangeHandler(newWindowElement) {
        const themeSelector = newWindowElement.querySelector('#theme');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.changeBackground(e.target.value);
            });
        }
    }

    bringToFront(windowController) {
        windowController.zIndex = ++this.highestZIndex;
        windowController.windowElement.style.zIndex = this.highestZIndex;
    }
}