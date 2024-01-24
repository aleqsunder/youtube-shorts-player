// ==UserScript==
// @name         Youtube Shorts Player
// @namespace    https://www.youtube.com/
// @match        https://www.youtube.com/*
// @version      0.0.11
// @updateURL    https://raw.githubusercontent.com/aleqsunder/youtube-shorts-player/main/player.user.js
// @downloadURL  https://raw.githubusercontent.com/aleqsunder/youtube-shorts-player/main/player.user.js
// @description  Allow to control shorts player
// @author       aleqsunder
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    const buttonTemplate = path => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" style="width: 27px; height: 27px"><path d="${path}"></path></svg>`

    const BUTTON_PLAY = buttonTemplate('M8 5v14l11-7z')
    const BUTTON_PAUSE = buttonTemplate('M6 19h4V5H6v14zm8-14v14h4V5h-4z')
    const BUTTON_AUDIO = buttonTemplate('M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z')
    const BUTTON_SPEED = buttonTemplate('M10,8v8l6-4L10,8L10,8z M6.3,5L5.7,4.2C7.2,3,9,2.2,11,2l0.1,1C9.3,3.2,7.7,3.9,6.3,5z M5,6.3L4.2,5.7C3,7.2,2.2,9,2,11 l1,.1C3.2,9.3,3.9,7.7,5,6.3z M5,17.7c-1.1-1.4-1.8-3.1-2-4.8L2,13c0.2,2,1,3.8,2.2,5.4L5,17.7z M11.1,21c-1.8-0.2-3.4-0.9-4.8-2 l-0.6,.8C7.2,21,9,21.8,11,22L11.1,21z M22,12c0-5.2-3.9-9.4-9-10l-0.1,1c4.6,.5,8.1,4.3,8.1,9s-3.5,8.5-8.1,9l0.1,1 C18.2,21.5,22,17.2,22,12z')

    const PLAYER_TAG_NAME = 'YTD-PLAYER'
    const PLAYER_ID = 'player'
    const STYLE_BLOCK_ID = 'yts-aleqsunder'
    const PANEL_CLASSNAME = 'yts-aleqsunder-controls'
    const YT_PLAYER_VOLUME = 'yt-player-volume'
    const YT_PLAYER_VOLUME_DEFAULT = 50
    const YT_PLAYER_VOLUME_MAX = 100
    const MONTH_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30

    let videoObserver = null
    let pathname = window.location.pathname

    function parseStringsToObjects (item = '') {
        if (!item || typeof item !== 'string' || item.length === 0 || item[0] !== '{') {
            return item
        }

        item = JSON.parse(item)
        for (let index of Object.keys(item)) {
            item[index] = parseStringsToObjects(item[index])
        }

        return item
    }

    Storage.prototype.getObject = function (key) {
        const value = this.getItem(key)
        return value && parseStringsToObjects(value)
    }

    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value))
    }

    function getVolumeStorage () {
        const local = localStorage.getObject(YT_PLAYER_VOLUME)
        if (local) {
            return local
        }

        return {
            data: {
                volume: YT_PLAYER_VOLUME_DEFAULT,
                muted: false
            }
        }
    }

    let lastVolume = getVolumeStorage()
    let lastSpeed = localStorage.getItem('aleqsunder-lastSpeed') ? localStorage.getItem('aleqsunder-lastSpeed') : '3'
    let nextVideoOnFinishPlay = localStorage.getItem('aleqsunder-nextVideoOnFinishPlay') ? localStorage.getItem('aleqsunder-nextVideoOnFinishPlay') === 'true' : false

    function getVolume () {
        return lastVolume?.data?.volume / YT_PLAYER_VOLUME_MAX ?? YT_PLAYER_VOLUME_DEFAULT
    }

    function setVolume (volume) {
        const now = Date.now()

        lastVolume = {
            ...lastVolume,
            data: {
                volume: volume * YT_PLAYER_VOLUME_MAX ^ 0,
                muted: false
            },
            creation: now,
            expiration: now + MONTH_IN_MILLISECONDS
        }

        const convertedToYouTubeFormatVolume = {
            ...lastVolume,
            data: JSON.stringify(lastVolume.data)
        }

        localStorage.setObject(YT_PLAYER_VOLUME, convertedToYouTubeFormatVolume)
        sessionStorage.setObject(YT_PLAYER_VOLUME, convertedToYouTubeFormatVolume)
    }

    class ShortsControlsPanel {
        controller = null
        range = null
        changing = false
        playing = true

        points = ['0%', '50%', '100%']
        attributes = {
            type: 'range',
            step: 'any',
            value: '0',
            min: '0',
            max: '1',
        }

        speedPoints = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2']
        speedAttributes = {
            ...this.attributes,
            step: '1',
            min: '0',
            max: '7',
        }

        constructor (player) {
            this.removeOldPanels()
            this.controller = new ShortsPlayerController(player)

            this.controls = this.generateControls()
            this.controller.overlay.appendChild(this.controls)

            this.smallerControls = this.generateSmallerControls()
            this.controller.overlay.appendChild(this.smallerControls)

            this.additionalControls = this.generateAdditionalControls()
            this.controller.container.appendChild(this.additionalControls)

            console.log('Controls created')

            this.controller.overlay.classList.add('yts-collapse-player')
            this.removeDuplicateControls()

            this.onChangeRangeHandler = this.onChangeRangeHandler.bind(this)
            this.onPlaying = this.onPlaying.bind(this)
            this.onPause = this.onPause.bind(this)
            this.onPressPlayButton = this.onPressPlayButton.bind(this)
        }

        removeOldPanels () {
            const bars = [...document.querySelectorAll('[id="progress-bar"]')]
            if (bars?.length > 0) {
                for (let bar of bars) {
                    bar.remove()
                }
            }

            const panels = [...document.getElementsByClassName('player-controls')]
            if (panels?.length > 0) {
                for (let panel of panels) {
                    panel.remove()
                }
            }

            const controls = [...document.getElementsByClassName(PANEL_CLASSNAME)]
            if (controls?.length > 1) {
                for (let control of controls) {
                    control.remove()
                }
            }
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

        onPlaying (button) {
            this.playing = true
            button.innerHTML = BUTTON_PAUSE
        }

        onPause (button) {
            this.playing = false
            button.innerHTML = BUTTON_PLAY
        }

        onPressPlayButton () {
            if (this.playing) {
                this.controller.video.pause()
            } else {
                this.controller.video.play()
            }
        }

        generatePlayButton () {
            const play = document.createElement('div')
            play.style = 'fill: white; cursor: pointer;'
            play.innerHTML = BUTTON_PAUSE
            play.addEventListener('click', _ => this.onPressPlayButton())

            this.controller.video.addEventListener('playing', _ => this.onPlaying(play))
            this.controller.video.addEventListener('pause', _ => this.onPause(play))

            return play
        }

        onChangeVideoRangeHandler (range) {
            this.controller.video.currentTime = range.value * this.controller.video.duration
        }

        generateVideoRange () {
            const videoRange = document.createElement('input')
            for (let attribute of Object.keys(this.attributes)) {
                videoRange.setAttribute(attribute, this.attributes[attribute])
            }

            videoRange.classList.add(`${PANEL_CLASSNAME}-input`)

            videoRange.addEventListener('change', _ => this.onChangeVideoRangeHandler(videoRange))
            videoRange.addEventListener('mousedown', _ => this.changing = true)
            videoRange.addEventListener('mouseup', _ => this.changing = false)

            return videoRange
        }

        generateSmallVideoRange () {
            const smallVideoRange = document.createElement('input')
            for (let attribute of Object.keys(this.attributes)) {
                smallVideoRange.setAttribute(attribute, this.attributes[attribute])
            }

            smallVideoRange.classList.add(`${PANEL_CLASSNAME}-input-small`)

            return smallVideoRange
        }

        onChangeSpeedRangeHandler (range) {
            this.controller.video.playbackRate = this.speedPoints[range.value]
            lastSpeed = range.value
            localStorage.setItem('aleqsunder-lastSpeed', String(range.value))
        }

        generateSpeedRange () {
            const speed = document.createElement('div')
            speed.classList.add(`${PANEL_CLASSNAME}-audio-block`)
            speed.style = 'fill: white; cursor: pointer;'

            const speedButton = document.createElement('svg')

            speed.appendChild(speedButton)
            speedButton.outerHTML = BUTTON_SPEED

            const speedRange = document.createElement('input')
            for (let attribute of Object.keys(this.speedAttributes)) {
                speedRange.setAttribute(attribute, this.speedAttributes[attribute])
            }

            speedRange.classList.add(`${PANEL_CLASSNAME}-input`)
            speedRange.classList.add(`${PANEL_CLASSNAME}-audio`)
            speedRange.addEventListener('input', _ => this.onChangeSpeedRangeHandler(speedRange))

            speed.appendChild(speedRange)

            const pointsWrapper = document.createElement('div')
            pointsWrapper.classList.add(`${PANEL_CLASSNAME}-range-labels`)

            for (let point of this.speedPoints) {
                const pointEl = document.createElement('span')
                pointEl.innerText = point
                pointsWrapper.appendChild(pointEl)
            }

            speed.appendChild(pointsWrapper)

            speedRange.value = lastSpeed
            this.onChangeSpeedRangeHandler(speedRange)

            return speed
        }

        onChangeAudioRangeHandler (range) {
            this.controller.video.volume = range.value
            setVolume(range.value)
        }

        generateAudioRange () {
            const audio = document.createElement('div')
            audio.classList.add(`${PANEL_CLASSNAME}-audio-block`)
            audio.style = 'fill: white; cursor: pointer;'

            const audioButton = document.createElement('svg')

            audio.appendChild(audioButton)
            audioButton.outerHTML = BUTTON_AUDIO

            const audioRange = document.createElement('input')
            for (let attribute of Object.keys(this.attributes)) {
                audioRange.setAttribute(attribute, this.attributes[attribute])
            }

            audioRange.classList.add(`${PANEL_CLASSNAME}-input`)
            audioRange.classList.add(`${PANEL_CLASSNAME}-audio`)
            audioRange.addEventListener('input', _ => this.onChangeAudioRangeHandler(audioRange))

            audio.appendChild(audioRange)

            const pointsWrapper = document.createElement('div')
            pointsWrapper.classList.add(`${PANEL_CLASSNAME}-range-labels`)

            for (let point of this.points) {
                const pointEl = document.createElement('span')
                pointEl.innerText = point
                pointsWrapper.appendChild(pointEl)
            }

            audio.appendChild(pointsWrapper)

            audioRange.value = getVolume()
            this.onChangeAudioRangeHandler(audioRange)

            return audio
        }

        updateRangeHandler (range) {
            if (!this.controller?.video || this.changing) {
                return
            }

            if (this.controller.video.duration < 0.1 || this.controller.video.currentTime < 0.1) {
                range.value = 0
                return
            }

            range.value = this.controller.video.currentTime / this.controller.video.duration

            if (nextVideoOnFinishPlay) {
                if (this.controller.video.duration - this.controller.video.currentTime < 0.05) { // tickrate 30/1000 = 0.03
                    this.controller.video.pause()
                    document.querySelector('#navigation-button-down yt-button-shape').click()
                }
            }
        }

        generateControls () {
            const controls = document.createElement('div')
            controls.classList.add(PANEL_CLASSNAME)

            const playButton = this.generatePlayButton()
            controls.appendChild(playButton)

            const videoRange = this.generateVideoRange()
            controls.appendChild(videoRange)

            const speedRange = this.generateSpeedRange()
            controls.appendChild(speedRange)

            const audioRange = this.generateAudioRange()
            controls.appendChild(audioRange)

            setInterval(_ => this.updateRangeHandler(videoRange), 1000/30)

            return controls
        }

        generateSmallerControls () {
            const controls = document.createElement('div')
            controls.classList.add(PANEL_CLASSNAME)
            controls.classList.add(PANEL_CLASSNAME + '-small')

            const smallVideoRange = this.generateSmallVideoRange()
            controls.appendChild(smallVideoRange)

            setInterval(_ => this.updateRangeHandler(smallVideoRange), 1000/15)

            return controls
        }

        onToggleAutoplayChecker (button) {
            nextVideoOnFinishPlay = button.getAttribute('aria-checked') === 'true' ? false : true
            button.setAttribute('aria-checked', String(nextVideoOnFinishPlay))
            localStorage.setItem('aleqsunder-nextVideoOnFinishPlay', String(nextVideoOnFinishPlay))
        }

        generateAutoplayChecker () {
            const container = document.createElement('div')
            container.classList.add('ytp-autonav-toggle-button-container')

            const toggleButton = document.createElement('div')
            toggleButton.classList.add('ytp-autonav-toggle-button')
            toggleButton.setAttribute('aria-checked', String(nextVideoOnFinishPlay))
            toggleButton.addEventListener('click', _ => this.onToggleAutoplayChecker(toggleButton))

            container.appendChild(toggleButton)

            return container
        }

        generateAdditionalControls () {
            const controls = document.createElement('div')
            controls.classList.add(PANEL_CLASSNAME)
            controls.classList.add(PANEL_CLASSNAME + '-additional')

            const autoplay = this.generateAutoplayChecker()
            controls.appendChild(autoplay)

            return controls
        }
    }

    class ShortsPlayerController {
        _player = null
        _video = null
        _reel = null
        _container = null
        _overlay = null

        constructor (player) {
            this._player = player
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
    }

    async function updatePlayerCallback (player) {
        new ShortsControlsPanel(player)
    }

    function videoObserverCallback (mutations) {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.tagName == PLAYER_TAG_NAME && node.id == PLAYER_ID) {
                    setTimeout(_ => updatePlayerCallback(node), 100)
                    videoObserver.disconnect()
                }
            }
        }
    }

    function runVideoObserver () {
        if (videoObserver instanceof MutationObserver) {
            videoObserver.disconnect()
        }

        videoObserver = new MutationObserver(videoObserverCallback)
        videoObserver.observe(document.body, {childList: true, subtree: true})
    }

    function addStyleBlock () {
        if (!document.getElementById(STYLE_BLOCK_ID)) {
            const style = document.createElement('style')
            style.id = STYLE_BLOCK_ID

            /**
             * Прогресс бар взят отсюда https://codepen.io/ShadowShahriar/pen/zYPPYrQ
             * и немного изменён под плеер shorts
             */
            style.innerHTML = `
.${PANEL_CLASSNAME} {
    padding: 1rem;
}

.${PANEL_CLASSNAME} > *:not(:first-child) {
    margin-left: 1.25rem;
}

.${PANEL_CLASSNAME}-small {
    padding: 0;
    position: absolute;
    bottom: 48px;
    width: 100%;

    transition: all .2s ease-in;
}

.${PANEL_CLASSNAME}-additional {
    top: -20px;
    right: 0;
    position: absolute;

    transition: all .2s ease-in;
}

.${PANEL_CLASSNAME},
.${PANEL_CLASSNAME}-audio {
    z-index: 1;
    pointer-events: auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.${PANEL_CLASSNAME}-audio {
    transform: rotate(-90deg);
    transform-origin: top left;
    position: absolute !important;
    bottom: 17px;
    right: -121px;

    transition: all .4s ease-in;
}

.${PANEL_CLASSNAME}-audio-block {
    position: relative;
}

.${PANEL_CLASSNAME}-audio-block input[type="range"] {
    opacity: 0;
    top: 35px;
}

.${PANEL_CLASSNAME}-audio-block:before {
    content: '';
    display: block;
    position: absolute;
    bottom: -10px;
    right: -10px;
    width: 47px;
    height: 195px;
    background: #00000000;
    border-top-left-radius: 7px;
    opacity: 0;
}

.${PANEL_CLASSNAME}-audio-block:hover:before {
    opacity: 1;
}

.${PANEL_CLASSNAME}-audio-block:hover input[type="range"] {
    opacity: 1;
    top: -8px;
}

.${PANEL_CLASSNAME}-range-labels {
    position: absolute;
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;

    bottom: -3px;
    right: 22px;
    height: 126px;
    text-align: right;
    color: white;

    opacity: 0;
    transition: all .1s ease-in;
}

.${PANEL_CLASSNAME}-audio-block:hover .${PANEL_CLASSNAME}-range-labels {
    opacity: 1;
    bottom: 40px;
}

.${PANEL_CLASSNAME} input.${PANEL_CLASSNAME}-input[type="range"] {
    flex: 1;

	color: #ef233c;
	--thumb-height: 1.5rem;
    --track-height: 0.5rem;
	--track-color: rgba(255, 255, 255, .7);
	--brightness-hover: 180%;
	--brightness-down: 80%;
	--clip-edges: 0em;
}

.${PANEL_CLASSNAME} .${PANEL_CLASSNAME}-audio-block input.${PANEL_CLASSNAME}-input[type="range"] {
    margin: 0 1.25rem;
}

.${PANEL_CLASSNAME} input.${PANEL_CLASSNAME}-input-small[type="range"] {
    flex: 1;

	color: #ef233c;
	--thumb-height: 0.2rem;
    --track-height: 0.2rem;
	--track-color: rgba(255, 255, 255, .7);
	--brightness-hover: 180%;
	--brightness-down: 80%;
	--clip-edges: 0em;
}

/* === range commons === */
.${PANEL_CLASSNAME} input[type="range"] {
	position: relative;
	background: #fff0;
	overflow: hidden;
}

.${PANEL_CLASSNAME} input[type="range"]:active {
	cursor: grabbing;
}

/* === WebKit specific styles === */
.${PANEL_CLASSNAME} input[type="range"],
.${PANEL_CLASSNAME} input[type="range"]::-webkit-slider-runnable-track,
.${PANEL_CLASSNAME} input[type="range"]::-webkit-slider-thumb {
	-webkit-appearance: none;
	transition: all ease 100ms;
	height: var(--thumb-height);
}

.${PANEL_CLASSNAME} input[type="range"]::-webkit-slider-runnable-track,
.${PANEL_CLASSNAME} input[type="range"]::-webkit-slider-thumb {
	position: relative;
}

.${PANEL_CLASSNAME} input[type="range"]::-webkit-slider-thumb {
	--thumb-radius: calc((var(--thumb-height) * 0.5) - 1px);
	--clip-top: calc((var(--thumb-height) - var(--track-height)) * 0.5 - 0.5px);
	--clip-bottom: calc(var(--thumb-height) - var(--clip-top));
	--clip-further: calc(100% + 1px);
	--box-fill: calc(-100vmax - var(--thumb-width, var(--thumb-height))) 0 0
		100vmax currentColor;

	width: var(--thumb-width, var(--thumb-height));
	background: linear-gradient(currentColor 0 0) scroll no-repeat left center /
		50% calc(var(--track-height) + 1px);
	background-color: currentColor;
	box-shadow: var(--box-fill);
	border-radius: var(--thumb-width, var(--thumb-height));

	filter: brightness(100%);
	clip-path: polygon(
		100% -1px,
		var(--clip-edges) -1px,
		0 var(--clip-top),
		-100vmax var(--clip-top),
		-100vmax var(--clip-bottom),
		0 var(--clip-bottom),
		var(--clip-edges) 100%,
		var(--clip-further) var(--clip-further)
	);
}

.${PANEL_CLASSNAME} input[type="range"]:hover::-webkit-slider-thumb {
	filter: brightness(var(--brightness-hover));
	cursor: grab;
}

.${PANEL_CLASSNAME} input[type="range"]:active::-webkit-slider-thumb {
	filter: brightness(var(--brightness-down));
	cursor: grabbing;
}

.${PANEL_CLASSNAME} input[type="range"]::-webkit-slider-runnable-track {
	background: linear-gradient(var(--track-color) 0 0) scroll no-repeat center /
		100% calc(var(--track-height) + 1px);
}

.${PANEL_CLASSNAME} input[type="range"]:disabled::-webkit-slider-thumb {
	cursor: not-allowed;
}

/* === Firefox specific styles === */
.${PANEL_CLASSNAME} input[type="range"],
.${PANEL_CLASSNAME} input[type="range"]::-moz-range-track,
.${PANEL_CLASSNAME} input[type="range"]::-moz-range-thumb {
	appearance: none;
	transition: all ease 100ms;
	height: var(--thumb-height);
}

.${PANEL_CLASSNAME} input[type="range"]::-moz-range-track,
.${PANEL_CLASSNAME} input[type="range"]::-moz-range-thumb,
.${PANEL_CLASSNAME} input[type="range"]::-moz-range-progress {
	background: #fff0;
}

.${PANEL_CLASSNAME} input[type="range"]::-moz-range-thumb {
	background: currentColor;
	border: 0;
	width: var(--thumb-width, var(--thumb-height));
	border-radius: var(--thumb-width, var(--thumb-height));
	cursor: grab;
}

.${PANEL_CLASSNAME} input[type="range"]:active::-moz-range-thumb {
	cursor: grabbing;
}

.${PANEL_CLASSNAME} input[type="range"]::-moz-range-track {
	width: 100%;
	background: var(--track-color);
}

.${PANEL_CLASSNAME} input[type="range"]::-moz-range-progress {
	appearance: none;
	background: currentColor;
	transition-delay: 30ms;
}

.${PANEL_CLASSNAME} input[type="range"]::-moz-range-track,
.${PANEL_CLASSNAME} input[type="range"]::-moz-range-progress {
	height: calc(var(--track-height) + 1px);
	border-radius: var(--track-height);
}

.${PANEL_CLASSNAME} input[type="range"]::-moz-range-thumb,
.${PANEL_CLASSNAME} input[type="range"]::-moz-range-progress {
	filter: brightness(100%);
}

.${PANEL_CLASSNAME} input[type="range"]:hover::-moz-range-thumb,
.${PANEL_CLASSNAME} input[type="range"]:hover::-moz-range-progress {
	filter: brightness(var(--brightness-hover));
}

.${PANEL_CLASSNAME} input[type="range"]:active::-moz-range-thumb,
.${PANEL_CLASSNAME} input[type="range"]:active::-moz-range-progress {
	filter: brightness(var(--brightness-down));
}

.${PANEL_CLASSNAME} input[type="range"]:disabled::-moz-range-thumb {
	cursor: not-allowed;
}

.yts-collapse-player {
    position: relative;

    top: 50px;
    transition: all .2s ease-in;
}

ytd-reel-video-renderer .ytd-reel-video-renderer {
    border-radius: 0 0 12px 12px;
}

ytd-reel-video-renderer:hover .yts-collapse-player {
    top: 0px;
}

ytd-reel-video-renderer:hover .${PANEL_CLASSNAME}-small {
    bottom: -5px;
}

ytd-reel-video-renderer:hover .${PANEL_CLASSNAME}-additional {
    top: 1rem;
}
            `

            document.head.appendChild(style)
        }
    }

    function observerCallback () {
        if (pathname !== window.location.pathname && window.location.pathname.includes('shorts')) {
            pathname = location.pathname
            addStyleBlock()
            runVideoObserver()
        }
    }

    function main () {
        addStyleBlock()
        runVideoObserver()

        const mainObserver = new MutationObserver(observerCallback)
        mainObserver.observe(document.body, {childList: true, subtree: true})
    }

    main()
})()
