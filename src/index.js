import './style/index.css'

import VideoObserver from "./js/VideoObserver.js"
import {parseStringsToObjects, setPredefinedParams} from "./js/_utils.js"

(function() {
    setPredefinedParams()
    
    Storage.prototype.getObject = function (key) {
        const value = this.getItem(key)
        return value && parseStringsToObjects(value)
    }
    
    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value))
    }
    
    const videoObserver = new VideoObserver()
    videoObserver.run()
    videoObserver.selfUpdate()
})()