export default class TextEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        this.defaultText = this.element.innerText;
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.updateInterval = this.options.updateInterval || 10;
        this.effectDuration = this.options.effectDuration || 500;
        this.currentEffectTime = 0;
        this.isActive = false;
    }

    startEffect() {
        if (this.isActive) return;

        this.isActive = true;
        this.currentEffectTime = 0;
        this.originalText = this.element.innerText;
        this.textArray = Array.from(this.originalText);
        this.randomTextArray = Array(this.textArray.length).fill('').map(() => this.getRandomChar());

        this.intervalId = setInterval(() => {
            this.updateTextEffect();
        }, this.updateInterval);
    }

    stopEffect() {
        if (!this.isActive) return;

        clearInterval(this.intervalId);
        this.element.innerText = this.originalText;
        this.isActive = false;
    }

    updateTextEffect() {
        if (this.currentEffectTime >= this.effectDuration) {
            this.stopEffect();
            return;
        }

        this.currentEffectTime += this.updateInterval;

        const revealPercentage = this.currentEffectTime / this.effectDuration;
        const revealIndex = Math.floor(revealPercentage * this.textArray.length);

        for (let i = 0; i < revealIndex; i++) {
            this.randomTextArray[i] = this.textArray[i];
        }

        this.element.innerText = this.randomTextArray.join('');
    }

    getRandomChar() {
        return this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }
}
