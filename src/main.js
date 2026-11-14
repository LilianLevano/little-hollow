import Phaser from 'phaser';
import '@fontsource/lilita-one'
import './style.css'
import GameScene from './scenes/GameScene.js';
import StartScene from './scenes/StartScene.js';
import {FONT, GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE} from './constants.js';

const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: Math.round(GAME_WIDTH * RENDER_SCALE),
    height: Math.round(GAME_HEIGHT * RENDER_SCALE),
    backgroundColor: '#1e1e2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [StartScene, GameScene],
}

// Text is drawn once on a canvas: the font has to be ready before the game starts
document.fonts.load(`32px "${FONT}"`).finally(() => {
    new Phaser.Game(config);
});
