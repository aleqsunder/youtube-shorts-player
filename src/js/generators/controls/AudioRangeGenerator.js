import {attributes, BUTTON_AUDIO, PANEL_CLASSNAME, points} from "../../_constants.js"
import {getVolume, setVolume} from "../../_utils.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class AudioRangeGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add(`${PANEL_CLASSNAME}-audio-block`)
        this.element.style = 'fill: white; cursor: pointer;'
        
        this.createAudioButton()
        this.createAudioRange()
        this.createPointsWrapper()
    }
    
    createAudioButton() {
        const audioButton = document.createElement('svg')
        this.element.appendChild(audioButton)
    
        // hack to correct svg view
        audioButton.outerHTML = BUTTON_AUDIO
    }
    
    createAudioRange() {
        const audioRange = document.createElement('input')
        for (let attribute of Object.keys(attributes)) {
            audioRange.setAttribute(attribute, attributes[attribute])
        }
    
        audioRange.classList.add(`${PANEL_CLASSNAME}-input`)
        audioRange.classList.add(`${PANEL_CLASSNAME}-audio`)
        audioRange.addEventListener('input', _ => this.onChangeAudioRangeHandler(audioRange))
        
        this.element.appendChild(audioRange)
        
        audioRange.value = getVolume()
        this.onChangeAudioRangeHandler(audioRange)
    }
    
    onChangeAudioRangeHandler (range) {
        this.controller.video.volume = range.value
        setVolume(range.value)
    }
    
    createPointsWrapper() {
        const pointsWrapper = document.createElement('div')
        pointsWrapper.classList.add(`${PANEL_CLASSNAME}-range-labels`)
    
        for (let point of points) {
            const pointEl = document.createElement('span')
            pointEl.innerText = point
            pointsWrapper.appendChild(pointEl)
        }
        
        this.element.appendChild(pointsWrapper)
    }
}