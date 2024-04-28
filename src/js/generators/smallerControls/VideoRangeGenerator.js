import {attributes, PANEL_CLASSNAME} from "../../_constants.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class VideoRangeGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('input')
        this.element.classList.add(`${PANEL_CLASSNAME}-input-small`)
        
        for (let attribute of Object.keys(attributes)) {
            this.element.setAttribute(attribute, attributes[attribute])
        }
        
        setInterval(_ => this.controller.updateRangeHandler(this.element), 1000/15)
    }
}