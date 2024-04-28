import {MONTH_IN_MILLISECONDS, YT_PLAYER_VOLUME, YT_PLAYER_VOLUME_DEFAULT, YT_PLAYER_VOLUME_MAX} from "./_constants.js"

export function getVolumeStorage() {
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

export function getVolume() {
    return getContext().lastVolume?.data?.volume / YT_PLAYER_VOLUME_MAX ?? YT_PLAYER_VOLUME_DEFAULT
}

export function setVolume(volume) {
    const now = Date.now()
    
    getContext().lastVolume = {
        ...getContext().lastVolume,
        data: {
            volume: volume * YT_PLAYER_VOLUME_MAX ^ 0,
            muted: false
        },
        creation: now,
        expiration: now + MONTH_IN_MILLISECONDS
    }
    
    const convertedToYouTubeFormatVolume = {
        ...getContext().lastVolume,
        data: JSON.stringify(getContext().lastVolume.data)
    }
    
    localStorage.setObject(YT_PLAYER_VOLUME, convertedToYouTubeFormatVolume)
    sessionStorage.setObject(YT_PLAYER_VOLUME, convertedToYouTubeFormatVolume)
}

export function parseStringsToObjects (item = '') {
    if (!item || typeof item !== 'string' || item.length === 0 || item[0] !== '{') {
        return item
    }
    
    item = JSON.parse(item)
    for (let index of Object.keys(item)) {
        item[index] = parseStringsToObjects(item[index])
    }
    
    return item
}

export function getContext() {
    if (!window.YoutubeShortsPlayer) {
        window.YoutubeShortsPlayer = {}
    }
    
    return window.YoutubeShortsPlayer
}

export function setPredefinedParams() {
    getContext().lastVolume = getContext().lastVolume?.data?.volume / YT_PLAYER_VOLUME_MAX ?? YT_PLAYER_VOLUME_DEFAULT
    getContext().lastSpeed = localStorage.getItem('aleqsunder-lastSpeed') ? localStorage.getItem('aleqsunder-lastSpeed') : '3'
    getContext().nextVideoOnFinishPlay = localStorage.getItem('aleqsunder-nextVideoOnFinishPlay')
        ? localStorage.getItem('aleqsunder-nextVideoOnFinishPlay') === 'true' : false
}