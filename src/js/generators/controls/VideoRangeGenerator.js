import {attributes, PANEL_CLASSNAME} from "../../_constants.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class VideoRangeGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('input')
        this.element.classList.add(`${PANEL_CLASSNAME}-input`)
        
        for (let attribute of Object.keys(attributes)) {
            this.element.setAttribute(attribute, attributes[attribute])
        }
        
        this.onChangeVideoRangeHandler = this.onChangeVideoRangeHandler.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        
        this.element.addEventListener('change', this.onChangeVideoRangeHandler)
        this.element.addEventListener('mousedown', this.onMouseDown)
        this.element.addEventListener('mouseup', this.onMouseUp)
        
        setInterval(_ => this.controller.updateRangeHandler(this.element), 1000/30)
    }
    
    onChangeVideoRangeHandler() {
        this.controller.video.currentTime = this.element.value * this.controller.video.duration
    }
    
    onMouseDown() {
        this.controller.changing = true
    }
    
    onMouseUp() {
        this.controller.changing = false
    }
}