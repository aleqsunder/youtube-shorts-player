import {PLAYER_ID, PLAYER_TAG_NAME} from "./_constants.js"
import {getContext} from "./_utils.js"

export default class ShortsPlayerController {
    _player = null
    _video = null
    _reel = null
    _container = null
    _overlay = null
    
    constructor (player) {
        this.changing = false
        this.playing = false
        
        this._player = player
        
        this.updateRangeHandler = this.updateRangeHandler.bind(this)
    }
    
    get player () {
        if (!this._player) {
            const [player] = this.player.querySelector(`${PLAYER_TAG_NAME.toLowerCase()}#${PLAYER_ID}`)
            this._player = player
        }
        
        return this._player
    }
    
    get video () {
        if (!this._video) {
            const [video] = this.player.getElementsByTagName('video')
            this._video = video
        }
        
        return this._video
    }
    
    get reel () {
        if (!this._reel) {
            this._reel = this.player.closest('ytd-reel-video-renderer')
        }
        
        return this._reel
    }
    
    get container () {
        if (!this._container) {
            this._container = this.player.closest('#player-container')
        }
        
        return this._container
    }
    
    get overlay () {
        if (!this._overlay) {
            this._overlay = this.reel.querySelector('#overlay')
        }
        
        return this._overlay
    }
    
    updateRangeHandler(element) {
        if (!this.video || this.changing) {
            return
        }
        
        if (this.video.duration < 0.1 || this.video.currentTime < 0.1) {
            element.value = 0
            return
        }
        
        element.value = this.video.currentTime / this.video.duration
        
        if (getContext().nextVideoOnFinishPlay) {
            // tick rate 30/1000 = 0.03
            if (this.video.duration - this.video.currentTime < 0.05) {
                this.video.pause()
                document.querySelector('#navigation-button-down yt-button-shape').click()
            }
        }
    }
}