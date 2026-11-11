import Phaser from 'phaser';

export const FONT = 'Lilita One'
export const ASSETS = 'assets/optimized'

// The whole layout is written in these coordinates, whatever the size of the screen
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// How much bigger than 1920x1080 the screen is (about 1.33 on a 2K screen)
const getFitScale = (width, height) => Math.min(width / GAME_WIDTH, height / GAME_HEIGHT) * devicePixelRatio
const AVAILABLE_SCALE = Math.max(getFitScale(screen.width, screen.height), getFitScale(innerWidth, innerHeight))
export const RENDER_SCALE = Phaser.Math.Clamp(AVAILABLE_SCALE, 1, 2)

// Left side: score and click button
export const PLAY_AREA_X = 255;
export const SCORE_FRAME_Y = 130;
export const SCORE_FRAME_SCALE = 0.34;
export const CLICK_BUTTON_SCALE = 0.42;

// Right side: the shop
export const SHOP_WIDTH = 436;
export const SHOP_X = GAME_WIDTH - 28 - SHOP_WIDTH;
export const HOVER_SCALE = 1.04;

export const MAX_VISIBLE_UPGRADES = 4
export const UPGRADES_Y = 90
export const UPGRADE_SIZE = 100
export const UPGRADE_GAP = (SHOP_WIDTH - UPGRADE_SIZE * MAX_VISIBLE_UPGRADES) / (MAX_VISIBLE_UPGRADES - 1);

export const BUILDINGS_Y = 226
export const SHOP_LIST_HEIGHT = GAME_HEIGHT - 20 - BUILDINGS_Y
export const CARD_GAP = 8
export const CARD_WIDTH = SHOP_WIDTH 
export const CARD_HEIGHT = CARD_WIDTH / 3

export const TOOLTIP_WIDTH = 620
export const TOOLTIP_MIN_Y = 290
export const TOOLTIP_LEFT = SHOP_X - 12 - TOOLTIP_WIDTH

// Middle: the village, one row per type of building (like Cookie Clicker), up to the shop.
// It scrolls in a window as high as the shop list, so both lists line up.
export const VILLAGE_X = 515
export const VILLAGE_Y = BUILDINGS_Y
export const VILLAGE_WIDTH = SHOP_X - 16 - VILLAGE_X
export const VILLAGE_HEIGHT = SHOP_LIST_HEIGHT
export const VILLAGE_ROW_HEIGHT = 124
export const VILLAGE_ROW_GAP = 8
export const VILLAGE_ICON = 104
export const VILLAGE_COPY_X = 56
export const VILLAGE_COPY_STEP = 60
export const VILLAGE_MAX_COPIES = 13

// Scrolling lists (shop and village): how close to an edge the items start to fade out
export const SCROLL_FADE = 64
