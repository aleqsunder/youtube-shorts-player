import {PANEL_CLASSNAME} from "../../_constants.js"
import VideoRangeGenerator from "./VideoRangeGenerator.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class SmallerControlsGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add(PANEL_CLASSNAME)
        this.element.classList.add(PANEL_CLASSNAME + '-small')
        
        this.createVideoRange()
    }
    
    createVideoRange() {
        const videoRange = new VideoRangeGenerator(this.controller)
        this.element.appendChild(videoRange.element)
    }
}