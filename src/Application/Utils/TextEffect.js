export default class TextEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        this.defaultText = this.element.innerText;
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.updateInterval = this.options.updateInterval || 5; // Updated interval for faster effect
        this.effectDuration = this.options.effectDuration || 300; // Updated duration for quicker effect
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

        this.lastUpdate = performance.now();
        this.updateTextEffect();
    }

    stopEffect() {
        if (!this.isActive) return;

        this.element.innerText = this.originalText;
        this.isActive = false;
    }

    updateTextEffect() {
        if (!this.isActive) return;

        const now = performance.now();
        const elapsed = now - this.lastUpdate;

        if (elapsed > this.updateInterval) {
            this.lastUpdate = now;

            if (this.currentEffectTime >= this.effectDuration) {
                this.stopEffect();
                return;
            }

            this.currentEffectTime += elapsed;
            const revealPercentage = this.currentEffectTime / this.effectDuration;
            const revealIndex = Math.floor(revealPercentage * this.textArray.length);

            for (let i = 0; i < revealIndex; i++) {
                this.randomTextArray[i] = this.textArray[i];
            }

            this.element.innerText = this.randomTextArray.join('');
        }

        requestAnimationFrame(() => this.updateTextEffect());
    }

    getRandomChar() {
        return this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }
}
