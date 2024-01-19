// ==UserScript==
// @name         Youtube Shorts Player
// @namespace    https://www.youtube.com/
// @match        https://www.youtube.com/*
// @version      0.0.4
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
    const BUTTON_MUTE = buttonTemplate('M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z')

    const PLAYER_TAG_NAME = 'YTD-PLAYER'
    const PLAYER_ID = 'player'
    const STYLE_BLOCK_ID = 'yts-aleqsunder'
    const PANEL_CLASSNAME = 'yts-aleqsunder-controls'

    let observer = null
    let pathname = window.location.pathname
    let lastVolume = localStorage.getItem('aleqsunder-lastVolume')?.length > 0 ? localStorage.getItem('aleqsunder-lastVolume') : '1'

    class ShortsControlsPanel {
        controller = null
        range = null
        changing = false
        playing = true

        attributes = {
            type: 'range',
            step: 'any',
            value: '0',
            min: '0',
            max: '1',
        }

        constructor (player) {
            this.removeOldControls()

            this.controller = new ShortsPlayerController(player)
            this.controls = this.generateControls()
            this.smallerControls = this.generateSmallerControls()

            this.controller.overlay.appendChild(this.controls)
            this.controller.overlay.appendChild(this.smallerControls)
            this.controller.overlay.classList.add('yts-collapse-player')

            this.onChangeRangeHandler = this.onChangeRangeHandler.bind(this)
            this.onPlaying = this.onPlaying.bind(this)
            this.onPause = this.onPause.bind(this)
            this.onPressPlayButton = this.onPressPlayButton.bind(this)
        }

        removeOldControls () {
            const bar = document.getElementById('progress-bar')
            if (bar) {
                bar.remove()
            }

            const panels = document.getElementsByClassName('player-controls')
            if (panels?.length > 0) {
                for (let panel of panels) {
                    panel.remove()
                }
            }

            const controls = document.getElementsByClassName(PANEL_CLASSNAME)
            if (controls?.length > 0) {
                for (let control of controls) {
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

        onChangeAudioRangeHandler (range) {
            this.controller.video.volume = range.value
            lastVolume = range.value
            localStorage.setItem('aleqsunder-lastVolume', String(range.value))
        }

        generateAudioRange () {
            const audio = document.createElement('div')
            audio.classList.add(`${PANEL_CLASSNAME}-audio-block`)
            audio.style = 'fill: white; cursor: pointer;'

            const audioButton = document.createElement('svg')

            audio.appendChild(audioButton)
            audioButton.outerHTML = BUTTON_AUDIO // insert hack

            const audioRange = document.createElement('input')
            for (let attribute of Object.keys(this.attributes)) {
                audioRange.setAttribute(attribute, this.attributes[attribute])
            }


            audioRange.classList.add(`${PANEL_CLASSNAME}-input`)
            audioRange.classList.add(`${PANEL_CLASSNAME}-audio`)
            audioRange.addEventListener('input', _ => this.onChangeAudioRangeHandler(audioRange))

            audio.appendChild(audioRange)

            audioRange.value = lastVolume
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
        }

        generateControls () {
            const controls = document.createElement('div')
            controls.classList.add(PANEL_CLASSNAME)

            const playButton = this.generatePlayButton()
            controls.appendChild(playButton)

            const videoRange = this.generateVideoRange()
            controls.appendChild(videoRange)

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
    }

    class ShortsPlayerController {
        _player = null
        _video = null
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

        get overlay () {
            if (!this._overlay) {
                const overlay = this.player.closest('ytd-reel-video-renderer').querySelector('#overlay')
                this._overlay = overlay
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
                    updatePlayerCallback(node)
                    observer.disconnect()
                }
            }
        }
    }

    function runVideoObserver () {
        observer = new MutationObserver(videoObserverCallback)
        observer.observe(document.body, {childList: true, subtree: true})
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


.${PANEL_CLASSNAME}-small {
    padding: 0;
    position: absolute;
    bottom: 48px;
    width: 100%;

    transition: all .3s;
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
    top: 155px;
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

.${PANEL_CLASSNAME} input.${PANEL_CLASSNAME}-input[type="range"] {
    flex: 1;

	color: #ef233c;
	--thumb-height: 1.5rem;
    --track-height: 0.5rem;
	--track-color: rgba(255, 255, 255, .7);
	--brightness-hover: 180%;
	--brightness-down: 80%;
	--clip-edges: 0em;

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
    transition: all .3s;
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

        const observer = new MutationObserver(observerCallback)
        observer.observe(document.body, {childList: true, subtree: true})
    }

    main()
})();
