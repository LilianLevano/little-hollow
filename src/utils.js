import {FONT, RENDER_SCALE} from './constants.js';

// Small helpers used everywhere in the game: number formatting and display shortcuts

export const compactNumber = new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 2})

export function formatNumber(value){
    return value < 1000000 ? `${Math.floor(value)}` : compactNumber.format(value)
}

export function capitalize(name){
    return name[0].toUpperCase() + name.slice(1)
}

export function textStyle(size, color = '#ffffff'){
    return {fontFamily: FONT, fontSize: `${size}px`, color, stroke: '#1a0f2e', strokeThickness: Math.ceil(size / 8), resolution: RENDER_SCALE}
}

export function fitInside(image, size){
    return image.setScale(size / Math.max(image.width, image.height))
}
