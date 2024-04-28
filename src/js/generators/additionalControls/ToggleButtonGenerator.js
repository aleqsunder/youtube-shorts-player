import {getContext} from "../../_utils.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class ToggleButtonGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add('ytp-autonav-toggle-button')
        this.element.setAttribute('aria-checked', String(getContext().nextVideoOnFinishPlay))
        
        this.onToggleAutoplayChecker = this.onToggleAutoplayChecker.bind(this)
        
        this.element.addEventListener('click', this.onToggleAutoplayChecker)
    }
    
    onToggleAutoplayChecker () {
        getContext().nextVideoOnFinishPlay = this.element.getAttribute('aria-checked') !== 'true'
        this.element.setAttribute('aria-checked', String(getContext().nextVideoOnFinishPlay))
        localStorage.setItem('aleqsunder-nextVideoOnFinishPlay', String(getContext().nextVideoOnFinishPlay))
    }
}