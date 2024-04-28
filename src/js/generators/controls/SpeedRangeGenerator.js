import {BUTTON_SPEED, PANEL_CLASSNAME, speedAttributes, speedPoints} from "../../_constants.js"
import {getContext} from "../../_utils.js"
import AbstractGenerator from "../AbstractGenerator.js"

export default class SpeedRangeGenerator extends AbstractGenerator {
    run() {
        this.element = document.createElement('div')
        this.element.classList.add(`${PANEL_CLASSNAME}-audio-block`)
        this.element.style = 'fill: white; cursor: pointer;'
        
        this.createSpeedButton()
        this.createSpeedRange()
        this.createPointsWrapper()
    }
    
    createSpeedButton() {
        const speedButton = document.createElement('svg')
        this.element.appendChild(speedButton)
        
        // hack to correct svg view
        speedButton.outerHTML = BUTTON_SPEED
    }
    
    createSpeedRange() {
        const speedRange = document.createElement('input')
        for (let attribute of Object.keys(speedAttributes)) {
            speedRange.setAttribute(attribute, speedAttributes[attribute])
        }
    
        speedRange.classList.add(`${PANEL_CLASSNAME}-input`)
        speedRange.classList.add(`${PANEL_CLASSNAME}-audio`)
        speedRange.addEventListener('input', _ => this.onChangeSpeedRangeHandler(speedRange))
        
        this.element.appendChild(speedRange)
        
        speedRange.value = getContext().lastSpeed
        this.onChangeSpeedRangeHandler(speedRange)
    }
    
    onChangeSpeedRangeHandler(range) {
        this.controller.video.playbackRate = speedPoints[range.value]
        getContext().lastSpeed = range.value
        localStorage.setItem('aleqsunder-lastSpeed', String(range.value))
    }
    
    createPointsWrapper() {
        const pointsWrapper = document.createElement('div')
        pointsWrapper.classList.add(`${PANEL_CLASSNAME}-range-labels`)
    
        for (let point of speedPoints) {
            const pointEl = document.createElement('span')
            pointEl.innerText = point
            pointsWrapper.appendChild(pointEl)
        }
        
        this.element.appendChild(pointsWrapper)
    }
}