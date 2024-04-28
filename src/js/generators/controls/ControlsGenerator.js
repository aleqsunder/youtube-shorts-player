import {PANEL_CLASSNAME} from "../../_constants.js"
import PlayButtonGenerator from "./PlayButtonGenerator.js"
import VideoRangeGenerator from "./VideoRangeGenerator.js"
import SpeedRangeGenerator from "./SpeedRangeGenerator.js"
import AudioRangeGenerator from "./AudioRangeGenerator.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class ControlsGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add(PANEL_CLASSNAME)
        
        this.createPlayButton()
        this.createVideoRange()
        this.createSpeedRange()
        this.createAudioRange()
    }
    
    createPlayButton() {
        const playButton = new PlayButtonGenerator(this.controller)
        this.element.appendChild(playButton.element)
    }
    
    createVideoRange() {
        const videoRange = new VideoRangeGenerator(this.controller)
        this.element.appendChild(videoRange.element)
    }
    
    createSpeedRange() {
        const speedRange = new SpeedRangeGenerator(this.controller)
        this.element.appendChild(speedRange.element)
    }
    
    createAudioRange() {
        const audioRange = new AudioRangeGenerator(this.controller)
        this.element.appendChild(audioRange.element)
    }
}