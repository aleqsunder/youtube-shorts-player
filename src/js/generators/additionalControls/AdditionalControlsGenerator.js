import {PANEL_CLASSNAME} from "../../_constants.js"
import AutoplayCheckerGenerator from "./AutoplayCheckerGenerator.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class AdditionalControlsGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add(PANEL_CLASSNAME)
        this.element.classList.add(PANEL_CLASSNAME + '-additional')
        
        this.createAutoplayChecker()
    }
    
    createAutoplayChecker() {
        const autoplayChecker = new AutoplayCheckerGenerator(this.controller)
        this.element.appendChild(autoplayChecker.element)
    }
}