import ShortsPlayerController from "./ShortsPlayerController.js"
import {PANEL_CLASSNAME} from "./_constants.js"
import ControlsGenerator from "./generators/controls/ControlsGenerator.js"
import SmallerControlsGenerator from "./generators/smallerControls/SmallerControlsGenerator.js"
import AdditionalControlsGenerator from "./generators/additionalControls/AdditionalControlsGenerator.js"

export default class ShortsControlsPanel {
    controller = null
    
    constructor (player) {
        this.removeOldPanels()
        this.controller = new ShortsPlayerController(player)
        
        this.controls = new ControlsGenerator(this.controller)
        this.controller.overlay.appendChild(this.controls.element)
        
        this.smallerControls = new SmallerControlsGenerator(this.controller)
        this.controller.overlay.appendChild(this.smallerControls.element)
        
        this.additionalControls = new AdditionalControlsGenerator(this.controller)
        this.controller.container.appendChild(this.additionalControls.element)
        
        console.log('Controls created')
        
        this.controller.overlay.classList.add('yts-collapse-player')
        this.removeDuplicateControls()
    }
    
    removeOldPanels() {
        const selectors = [
            { selector: '[id="progress-bar"]', minCount: 0 },
            { selector: '.player-controls', minCount: 0 },
            { selector: `.${PANEL_CLASSNAME}`, minCount: 1 },
        ]
        
        selectors.forEach(({ selector, minCount }) => {
            const elements = [...document.querySelectorAll(selector)]
            if (elements.length > minCount) {
                elements.forEach(element => element.remove())
            }
        })
    }
    
    removeDuplicateControls () {
        let uniqueList = []
        const controls = [...document.getElementsByClassName(PANEL_CLASSNAME)]
        if (controls?.length > 1) {
            for (let control of controls) {
                if (!uniqueList.includes(control.className)) {
                    uniqueList.push(control.className)
                    continue
                }
                
                control.remove()
            }
        }
    }
}