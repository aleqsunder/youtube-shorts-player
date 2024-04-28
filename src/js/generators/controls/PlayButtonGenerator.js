import {BUTTON_PAUSE, BUTTON_PLAY} from "../../_constants.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class PlayButtonGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.style = 'fill: white; cursor: pointer;'
        this.element.innerHTML = BUTTON_PAUSE
    
        this.onPressPlayButton = this.onPressPlayButton.bind(this)
        this.onPlaying = this.onPlaying.bind(this)
        this.onPause = this.onPause.bind(this)
    
        this.element.addEventListener('click', this.onPressPlayButton)
        this.controller.video.addEventListener('playing', this.onPlaying)
        this.controller.video.addEventListener('pause', this.onPause)
    }
    
    onPlaying () {
        this.controller.playing = true
        this.element.innerHTML = BUTTON_PAUSE
    }
    
    onPause () {
        this.controller.playing = false
        this.element.innerHTML = BUTTON_PLAY
    }
    
    onPressPlayButton () {
        if (this.controller.playing) {
            this.controller.video.pause()
        } else {
            this.controller.video.play()
        }
    }
}