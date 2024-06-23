import { ClassNotifications } from "./classNotifications.js";

export class Snake {

    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.context = null;
        this.snake = [{ top: 200, left: 200 }];
        this.direction = 'right';
        this.apple = null;
        this.gameOver = false;
        this.walls = [];
        this.board = [];
        this.speed = 100;
        this.fastSpeed = 40;
        this.fastModeStartTime = null;
        this.currentSpeed = this.speed;
        this.speedTimeout = null;
        this.lastWallScore = 0;
        this.goldenApple = null;
        this.goldenAppleTimeout = null;
        this.lastTime = Date.now();
        this.isPaused = false;
        this.lastTailPosition = null;
        this.gameLoop = this.gameLoop.bind(this);
        this.snakeColor = '#0e881f';
        this.keyIsDown = false;
    }

    init() {
        this.setupCanvas();
        this.setupGame();
        this.setupEventHandlers();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas = document.getElementById(this.canvasId);
        this.context = this.canvas.getContext('2d');
        this.board = Array(this.canvas.width / 10).fill(undefined, undefined, undefined).map(() => Array(this.canvas.height / 10).fill(0));
        this.createPauseOverlay();
        this.snakeColor = localStorage.getItem('snakeColor') || '#0e881f';
        this.canvas.parentElement.appendChild(this.pauseOverlay);
    }

    setupGame() {
        this.draw();
        this.update();
        this.snake = [{ top: 200, left: 200 }];
        this.walls = [];
        this.apple = null;
        this.direction = 'right';
        this.gameOver = false;
    }

    setupEventHandlers() {
        let keys = localStorage.getItem('keys');
        keys = keys ? JSON.parse(keys) : {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        };

        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }

        this.keydownHandler = this.createKeydownHandler(keys);
        window.addEventListener('keydown', this.keydownHandler);

        if (this.keyupHandler) {
            window.removeEventListener('keyup', this.keyupHandler);
        }

        this.keyupHandler = this.createKeyupHandler(keys);
        window.addEventListener('keyup', this.keyupHandler);

        if (this.keydownPauseHandler) {
            window.removeEventListener('keydown', this.keydownPauseHandler);
        }

        this.keydownPauseHandler = (e) => this.handleKeyDown(e);
        window.addEventListener('keydown', this.keydownPauseHandler);
    }

    createKeydownHandler(keys) {
        return (e) => {
            const mappedKey = Object.keys(keys).find(key => keys[key].toLowerCase() === e.key.toLowerCase());
            if (mappedKey) {
                this.changeDirection(mappedKey, keys);
            }
            if (!this.speedTimeout && !this.keyIsDown && this.direction === mappedKey) {
                this.keyIsDown = true;
                this.fastModeStartTime = Date.now();
                this.speedTimeout = setTimeout(() => {
                    this.currentSpeed = this.fastSpeed;
                    this.speedTimeout = null;
                }, 100);
            }
        };
    }

    createKeyupHandler(keys) {
        return (e) => {
            this.keyIsDown = false;
            this.changeDirection(e.key, keys);
            if (this.speedTimeout) {
                clearTimeout(this.speedTimeout);
                this.speedTimeout = null;
            }
            if (this.fastModeStartTime) {
                const fastModeDuration = Date.now() - this.fastModeStartTime;
                if (fastModeDuration > 1000) {
                    const scoreReduction = Math.floor(fastModeDuration / 1000);
                    this.snake.length = Math.max(1, this.snake.length - scoreReduction);
                }
                this.fastModeStartTime = null;
            }
            this.currentSpeed = this.speed;
        };
    }

    createPauseOverlay() {
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.style.position = 'absolute';
        this.pauseOverlay.style.top = '40px';
        this.pauseOverlay.style.left = '0';
        this.pauseOverlay.style.width = '100%';
        this.pauseOverlay.style.height = 'calc(100% - 40px)';
        this.pauseOverlay.style.display = 'none';
        this.pauseOverlay.style.borderRadius = '0 0 10px 10px';
        this.pauseOverlay.style.justifyContent = 'center';
        this.pauseOverlay.style.alignItems = 'center';
        this.pauseOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.pauseOverlay.style.backdropFilter = 'blur(8px)';
        this.pauseOverlay.innerHTML = '<img class="pause" src="/pause.svg" alt="Pause">';
    }

    drawScore() {
        this.context.fillStyle = 'black';
        this.context.font = '16px Arial';
        const score = this.snake.length - 1;
        this.context.fillText('Score: ' + score, 10, 30);
        const bestScore = localStorage.getItem('bestScore') || 0;
        this.context.fillText('Meilleur score: ' + bestScore, 120, 30);
    }

    updateBestScore() {
        const score = this.snake.length - 1;
        const bestScore = localStorage.getItem('bestScore') || 0;
        if (score > bestScore) {
            localStorage.setItem('bestScore', score.toString());
        }
    }

    gameLoop(time) {
        if (this.isPaused) {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        if (!this.gameOver) {
            const now = Date.now();
            const elapsed = now - this.lastTime;

            if (elapsed > this.currentSpeed) {
                this.lastTime = now - (elapsed % this.currentSpeed);
                this.update();
            }

            this.draw();
        }
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.snakeColor;

        if (this.lastTailPosition) {
            this.context.clearRect(this.lastTailPosition.left, this.lastTailPosition.top, 10, 10);
        }

        this.snake.forEach((part, index) => {
            this.context.fillRect(part.left, part.top, 10, 10);
            if (index === 0) {
                this.context.fillStyle = 'white';
                if (this.direction === 'right' || this.direction === 'left') {
                    this.context.fillRect(part.left + 2, part.top + 2, 2, 2);
                    this.context.fillRect(part.left + 6, part.top + 2, 2, 2);
                } else {
                    this.context.fillRect(part.left + 2, part.top + 2, 2, 2);
                    this.context.fillRect(part.left + 2, part.top + 6, 2, 2);
                }
                this.context.fillStyle = this.snakeColor;
            }
        });
        if (this.apple) {
            this.context.beginPath();
            this.context.arc(this.apple.left + 5, this.apple.top + 5, 5, 0, Math.PI * 2, true);
            this.context.closePath();
            this.context.fillStyle = 'red';
            this.context.fill();
            this.context.fillStyle = 'green';
            this.context.fillRect(this.apple.left + 2, this.apple.top - 2, 3, 2);
            this.context.fillRect(this.apple.left + 5, this.apple.top - 2, 3, 2);
        }
        if (this.goldenApple) {
            this.context.beginPath();
            this.context.arc(this.goldenApple.left + 5, this.goldenApple.top + 5, 5, 0, Math.PI * 2, true);
            this.context.closePath();
            this.context.fillStyle = 'gold';
            this.context.fill();

            this.context.fillStyle = 'green';
            this.context.fillRect(this.goldenApple.left + 2, this.goldenApple.top - 2, 3, 2);
            this.context.fillRect(this.goldenApple.left + 5, this.goldenApple.top - 2, 3, 2);
        }
        this.drawScore();
        this.context.fillStyle = 'black';
        this.walls.forEach(wall => {
            this.context.fillRect(wall.left, wall.top, 10, 10);
        });
    }

    checkSelfCollision() {
        const head = this.snake[0];
        return this.board[head.left / 10][head.top / 10] === 1;
    }

    update() {
        const head = this.calculateNewHeadPosition();

        if (this.isOutOfBounds(head)) {
            this.handleGameOver();
            return;
        }

        this.updateBoard();

        this.snake.unshift(head);
        this.updateOccupiedPositions();

        if (this.apple && this.isAppleEaten(head)) {
            this.apple = null;
        } else {
            this.updateTailPosition();
            this.snake.pop();
        }

        if (this.goldenApple && this.isGoldenAppleEaten(head)) {
            this.extendSnake();
            this.removeGoldenApple();
        }

        if (this.checkSelfCollision() || this.checkWallCollision()) {
            this.handleGameOver();
        }

        if (!this.apple) {
            this.generateApple();
        }

        this.generateWalls();
        this.updateBestScore();
    }

    calculateNewHeadPosition() {
        const head = Object.assign({}, this.snake[0]);
        switch (this.direction) {
            case 'left':
                head.left -= 10;
                break;
            case 'up':
                head.top -= 10;
                break;
            case 'right':
                head.left += 10;
                break;
            case 'down':
                head.top += 10;
                break;
        }
        return head;
    }

    isOutOfBounds(head) {
        return head.left < 0 || head.left >= this.canvas.width || head.top < 0 || head.top >= this.canvas.height;
    }

    updateBoard() {
        this.board = this.board.map((row, x) => row.map((cell, y) => {
            if (this.snake.some(part => part.left === x * 10 && part.top === y * 10)) {
                return 1;
            } else if (this.apple && this.apple.left === x * 10 && this.apple.top === y * 10) {
                return 2;
            } else if (this.goldenApple && this.goldenApple.left === x * 10 && this.goldenApple.top === y * 10) {
                return 3;
            } else if (this.walls.some(wall => wall.left === x * 10 && wall.top === y * 10)) {
                return 4;
            } else {
                return 0;
            }
        }));
    }

    updateOccupiedPositions() {
        this.occupiedPositions = new Set(this.snake.map(part => `${part.left},${part.top}`));
        this.walls.forEach(wall => this.occupiedPositions.add(`${wall.left},${wall.top}`));
    }

    isAppleEaten(head) {
        return this.apple.top === head.top && this.apple.left === head.left;
    }

    updateTailPosition() {
        this.lastTailPosition = { ...this.snake[this.snake.length - 1] };
    }

    isGoldenAppleEaten(head) {
        return this.goldenApple.top === head.top && this.goldenApple.left === head.left;
    }

    extendSnake() {
        for (let i = 0; i < 5; i++) {
            const lastElement = this.snake[this.snake.length - 1];
            this.snake.push({ top: lastElement.top, left: lastElement.left });
        }
    }

    removeGoldenApple() {
        clearTimeout(this.goldenAppleTimeout);
        this.goldenApple = null;
        this.goldenAppleTimeout = null;
    }

    changeDirection(key, keys) {
        const lowerCaseKey = key.toLowerCase();
        const lowerCaseKeys = {
            up: keys.up.toLowerCase(),
            down: keys.down.toLowerCase(),
            left: keys.left.toLowerCase(),
            right: keys.right.toLowerCase()
        };

        switch (lowerCaseKey) {
            case lowerCaseKeys.up:
                this.direction = 'up';
                break;
            case lowerCaseKeys.down:
                this.direction = 'down';
                break;
            case lowerCaseKeys.left:
                this.direction = 'left';
                break;
            case lowerCaseKeys.right:
                this.direction = 'right';
                break;
        }
    }

    checkWallCollision() {
        const head = this.snake[0];
        return this.board[head.left / 10][head.top / 10] === 4;
    }

    stopGame() {
        this.gameOver = true;
    }

    generateWalls() {
        const score = this.snake.length - 1;
        if (score >= 10 && score - this.lastWallScore >= 10) {
            const numberOfWalls = Math.pow(score, 1);
            for (let i = 0; i < numberOfWalls; i++) {
                this.walls.push({
                    top: Math.floor(Math.random() * this.canvas.height / 10) * 10,
                    left: Math.floor(Math.random() * this.canvas.width / 10) * 10
                });
            }
            this.lastWallScore = score;
        }
    }

    generateApple() {
        const freePositions = this.getFreePositions();
        const randomIndex = Math.floor(Math.random() * freePositions.length);
        this.apple = freePositions[randomIndex];

        if (Math.random() < 0.10) {
            const goldenAppleIndex = Math.floor(Math.random() * freePositions.length);
            this.goldenApple = freePositions[goldenAppleIndex];
            this.goldenAppleTimeout = setTimeout(() => this.removeGoldenApple(), 6000);
        }

        this.board[this.apple.left / 10][this.apple.top / 10] = 2;
    }

    getFreePositions() {
        const freePositions = [];
        for (let x = 0; x < this.board.length; x++) {
            for (let y = 0; y < this.board[0].length; y++) {
                if (this.board[x][y] === 0) {
                    freePositions.push({ left: x * 10, top: y * 10 });
                }
            }
        }
        return freePositions;
    }

    handleGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;

            const notifications = new ClassNotifications();
            const replayButton = document.createElement('button');
            const parentWindow = this.canvas.closest('.window');
            const style = getComputedStyle(parentWindow);
            const color = style.getPropertyValue('--random-color');
            let existingReplayButton = this.canvas.parentElement.querySelector('.replay-button');


            replayButton.textContent = 'Rejouer';

            if (!existingReplayButton) {
                notifications.displayNotification('Game Over', 'Score: ' + (this.snake.length - 1), replayButton, null, color);
            }

            replayButton.onclick = null;
            replayButton.addEventListener('click', () => this.restartGame());

            this.updateBestScore();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'p' || e.key === 'P') {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.pauseOverlay.style.display = 'flex';
            } else {
                this.pauseOverlay.style.display = 'none';
                this.gameLoop();
            }
        }
    }

    restartGame() {
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        const newCanvas = document.createElement('canvas');
        newCanvas.id = this.canvasId;
        newCanvas.classList.add('snake');
        newCanvas.width = oldWidth;
        newCanvas.height = oldHeight;
        this.canvas.replaceWith(newCanvas);
        this.canvas = newCanvas;
        this.pauseOverlay.remove();
        this.init();
    }
}