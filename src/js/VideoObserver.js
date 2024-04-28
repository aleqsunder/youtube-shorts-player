import {PLAYER_ID, PLAYER_TAG_NAME} from "./_constants.js"
import ShortsControlsPanel from "./ShortsControlsPanel.js"
import {getContext} from "./_utils.js"

export default class VideoObserver {
    constructor() {
        this.observerCallback = this.observerCallback.bind(this)
        this.updatePlayerCallback = this.updatePlayerCallback.bind(this)
        this.selfUpdateObserverCallback = this.selfUpdateObserverCallback.bind(this)
    }
    
    run() {
        if (getContext().videoObserver instanceof MutationObserver) {
            getContext().videoObserver.disconnect()
        }
    
        getContext().videoObserver = new MutationObserver(this.observerCallback)
        getContext().videoObserver.observe(document.body, {childList: true, subtree: true})
    }
    
    observerCallback(mutations) {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.tagName == PLAYER_TAG_NAME && node.id == PLAYER_ID) {
                    setTimeout(_ => this.updatePlayerCallback(node), 100)
                    getContext().videoObserver.disconnect()
                }
            }
        }
    }
    
    updatePlayerCallback(player) {
        return new ShortsControlsPanel(player)
    }
    
    selfUpdate() {
        const mainObserver = new MutationObserver(this.selfUpdateObserverCallback)
        mainObserver.observe(document.body, {childList: true, subtree: true})
    }
    
    selfUpdateObserverCallback() {
        if (getContext().pathname !== window.location.pathname && window.location.pathname.includes('shorts')) {
            getContext().pathname = window.location.pathname
            
            this.run()
        }
    }
}