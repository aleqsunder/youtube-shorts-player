import ToggleButtonGenerator from "./ToggleButtonGenerator.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class AutoplayCheckerGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add('ytp-autonav-toggle-button-container')
        
        this.createToggleButton()
    }
    
    createToggleButton() {
        const toggleButton = new ToggleButtonGenerator(this.controller)
        this.element.appendChild(toggleButton.element)
    }
}