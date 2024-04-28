import IconFactory from "./icons/IconFactory.js"

export const PLAYER_TAG_NAME = 'YTD-PLAYER'
export const PLAYER_ID = 'player'
export const PANEL_CLASSNAME = 'yts-aleqsunder-controls'
export const YT_PLAYER_VOLUME = 'yt-player-volume'
export const YT_PLAYER_VOLUME_DEFAULT = 50
export const YT_PLAYER_VOLUME_MAX = 100
export const MONTH_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30

const {play, pause, audio, speed} = IconFactory.getIconTypes()
export const BUTTON_PLAY = IconFactory.createIcon(play)
export const BUTTON_PAUSE = IconFactory.createIcon(pause)
export const BUTTON_AUDIO = IconFactory.createIcon(audio)
export const BUTTON_SPEED = IconFactory.createIcon(speed)

export const points = ['0%', '50%', '100%']
export const attributes = {
    type: 'range',
    step: 'any',
    value: '0',
    min: '0',
    max: '1',
}
export const speedPoints = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2']
export const speedAttributes = {
    ...attributes,
    step: '1',
    min: '0',
    max: '7',
}