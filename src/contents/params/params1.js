export const params1 = (className) => {
    return `
        <div id="param1_content" class="${ className }">
            <h2>Paramètres</h2>
            <div>
                <label for="theme">Fond d'écran</label>
                <select name="theme" id="theme">
                    <option value="pattern">Pattern</option>
                    <option value="organic">Organic</option>
                </select>
            </div>
            <div>
                <label for="icon-size-slider">Taille des icônes :</label>
                <input type="range" id="icon-size-slider" min="10" max="100" value="50">
            </div>
        </div>
    `
}