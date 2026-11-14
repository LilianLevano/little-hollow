import Phaser from 'phaser';
import {ASSETS, GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE, RIFT_LIGHT} from '../constants.js'
import {BUILDINGS} from '../data/buildings.js';
import {UPGRADES} from '../data/upgrades.js';
import {textStyle, fitInside} from '../utils.js';

// Where the purple rift is in background.webp, in pixels of the image
const RIFT_IN_IMAGE = {x: 742, y: 328};
// A bit bigger than in the game (0.75), so the slow zoom and the parallax never show the edges of the image
const BACKGROUND_SCALE = 0.8;
// The title sits in the dark, empty part of the sky, on the right
const TITLE_X = 1450;
const TITLE_Y = 450;
// When the rift "opens" in entry-rift.wav (the deep whoom), in ms
const RIFT_OPENS_AT = 1000;

export default class StartScene extends Phaser.Scene{
    constructor(){
        super('StartScene');
    }

    preload(){
        this.cameras.main.setZoom(RENDER_SCALE).centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
        this.makeLoadingBar();

        this.load.image('click-image', `${ASSETS}/clic-button.png`)
        this.load.image('background', `${ASSETS}/background.webp`)
        this.load.image('building-contour', `${ASSETS}/building-contour.png`)
        this.load.image('upgrade-contour', `${ASSETS}/upgrade-contour.png`)
        this.load.image('rubis', `${ASSETS}/rubis.png`)
        this.load.image('score-contour', `${ASSETS}/score-contour.png`)

        for (const building of BUILDINGS){
            this.load.image(building.icon, `${ASSETS}/buildings/${building.icon}.png`)
        }

        for (const upgrade of UPGRADES){
            this.load.image(upgrade.icon, `${ASSETS}/upgrades/${upgrade.icon}.png`)
        }

        this.load.audio('click-sound', `${ASSETS}/sounds/click/click-pop-scatter.wav`)
        this.load.audio('buy-upgrade-sound', `${ASSETS}/sounds/upgrade/upgrade-gem-burst.wav`)
        this.load.audio('buy-building-sound', `${ASSETS}/sounds/building/building-hammer.wav`)
        this.load.audio('entry-sound', `${ASSETS}/sounds/entry/entry-rift.wav`)
    }

    create(){
        this.entering = false;
        this.pointerMoved = false;
        this.parallax = {x: 0, y: 0};

        this.makeTextures();
        this.makeSky();
        this.add.image(0, 0, 'vignette').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        this.makeFireflies();
        this.makeTitle();

        // A little star shines somewhere every 300 ms
        this.time.addEvent({delay: 300, loop: true, callback: () => this.twinkle()});

        this.input.setDefaultCursor('pointer');
        this.input.on('pointermove', () => this.pointerMoved = true);
        this.input.once('pointerdown', () => this.enter());
        this.input.keyboard.once('keydown', () => this.enter());

        // Same color as the loading screen, so it blends into the title
        this.cameras.main.fadeIn(1200, 30, 30, 46);
    }

    update(time){
        // The letters float like a wave, each one a little after the previous one
        for (const letter of this.letters){
            letter.y = letter.baseY + letter.lift + Math.sin(time / 500 - letter.index * 0.45) * 5;
        }
        this.gem.y = this.gem.baseY + Math.sin(time / 700) * 8;

        if (this.entering) return;

        this.gem.rotation = Math.sin(time / 1100) * 0.06;

        // Parallax: the sky moves a little against the mouse and the title a little with it, which gives depth
        const pointer = this.input.activePointer;
        const aimX = this.pointerMoved ? pointer.worldX / GAME_WIDTH - 0.5 : 0;
        const aimY = this.pointerMoved ? pointer.worldY / GAME_HEIGHT - 0.5 : 0;
        this.parallax.x += (aimX - this.parallax.x) * 0.05;
        this.parallax.y += (aimY - this.parallax.y) * 0.05;

        this.sky.setPosition(this.riftX - this.parallax.x * 24, this.riftY - this.parallax.y * 12);
        this.title.setPosition(TITLE_X + this.parallax.x * 10, TITLE_Y + this.parallax.y * 6);
    }

    // Shown while preload() works: nothing is loaded yet, so it is drawn with code only
    makeLoadingBar(){
        const width = 420;
        const x = GAME_WIDTH / 2 - width / 2;
        const y = GAME_HEIGHT / 2 + 20;
        const label = this.add.text(GAME_WIDTH / 2, y - 44, 'Loading', textStyle(30, '#c9a7ff')).setOrigin(0.5);
        const bar = this.add.graphics();

        const draw = (progress) => {
            bar.clear();
            bar.fillStyle(0xffffff, 0.12).fillRoundedRect(x, y, width, 10, 5);
            bar.fillStyle(0xffd66b, 1).fillRoundedRect(x, y, Math.max(10, width * progress), 10, 5);
        };
        draw(0);

        this.load.on('progress', draw);
        this.load.once('complete', () => {
            label.destroy();
            bar.destroy();
        });
    }

    // Small textures drawn with code: a soft round light, a 4-point star, a thin golden line and a dark frame
    makeTextures(){
        if (this.textures.exists('soft-dot')) return;

        const draw = (key, width, height, paint) => {
            const texture = this.textures.createCanvas(key, width, height);
            paint(texture.getContext());
            texture.refresh();
        };

        draw('soft-dot', 64, 64, (context) => {
            const light = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            // The light fades out more and more slowly, so the edge of the circle can't be seen
            light.addColorStop(0, 'rgba(255, 255, 255, 1)');
            light.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
            light.addColorStop(0.45, 'rgba(255, 255, 255, 0.22)');
            light.addColorStop(0.7, 'rgba(255, 255, 255, 0.06)');
            light.addColorStop(1, 'rgba(255, 255, 255, 0)');
            context.fillStyle = light;
            context.fillRect(0, 0, 64, 64);
        });

        draw('sparkle', 64, 64, (context) => {
            // 8 points around the center, alternately far and close: a star with 4 thin branches
            context.fillStyle = '#ffffff';
            context.beginPath();
            for (let i = 0; i < 8; i++){
                const angle = i * Math.PI / 4;
                const radius = i % 2 === 0 ? 32 : 4;
                context.lineTo(32 + Math.cos(angle) * radius, 32 + Math.sin(angle) * radius);
            }
            context.closePath();
            context.fill();
        });

        draw('divider', 512, 4, (context) => {
            const line = context.createLinearGradient(0, 0, 512, 0);
            line.addColorStop(0, 'rgba(255, 214, 107, 0)');
            line.addColorStop(0.5, 'rgba(255, 214, 107, 1)');
            line.addColorStop(1, 'rgba(255, 214, 107, 0)');
            context.fillStyle = line;
            context.fillRect(0, 1, 512, 2);
        });

        // Drawn small and stretched over the whole screen: the circle becomes an oval that darkens the corners
        draw('vignette', 256, 256, (context) => {
            const shade = context.createRadialGradient(128, 128, 70, 128, 128, 182);
            shade.addColorStop(0, 'rgba(10, 4, 24, 0)');
            shade.addColorStop(1, 'rgba(10, 4, 24, 0.8)');
            context.fillStyle = shade;
            context.fillRect(0, 0, 256, 256);
        });
    }

    // Everything that belongs to the sky is in one container placed on the rift: scaling it zooms toward the rift
    makeSky(){
        const background = this.textures.get('background').getSourceImage();
        // Same "cover" scale as in GameScene, so the rift is at the same place in both scenes
        const gameScale = Math.max(GAME_WIDTH / background.width, GAME_HEIGHT / background.height);
        this.riftX = RIFT_IN_IMAGE.x * gameScale;
        this.riftY = RIFT_IN_IMAGE.y * gameScale;

        const image = this.add.image(0, 0, 'background')
            .setOrigin(RIFT_IN_IMAGE.x / background.width, RIFT_IN_IMAGE.y / background.height)
            .setScale(BACKGROUND_SCALE);

        this.riftGlow = this.add.image(0, 0, 'soft-dot').setTint(0xa64dff).setBlendMode('ADD').setScale(7).setAlpha(0.35);
        this.riftCore = this.add.image(0, 0, 'soft-dot').setTint(0xffd9ff).setBlendMode('ADD').setScale(2).setAlpha(0.5);

        // Purple dust pulled into the rift from an oval around it
        this.riftDust = this.add.particles(0, 0, 'soft-dot', {
            emitZone: {type: 'random', source: {getRandomPoint: (point) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = Phaser.Math.Between(200, 340);
                point.x = Math.cos(angle) * distance;
                point.y = Math.sin(angle) * distance * 0.55;
                return point;
            }}},
            moveToX: 0,
            moveToY: 0,
            lifespan: {min: 1400, max: 2600},
            scale: {start: 0.2, end: 0.03},
            alpha: {values: [0, 0.9, 0]},
            tint: [0xc58bff, 0xff9ce6, 0xffffff],
            blendMode: 'ADD',
            frequency: 70,
            advance: 2600,
        });

        this.sky = this.add.container(this.riftX, this.riftY, [image, this.riftGlow, this.riftCore, this.riftDust]);

        this.tweens.add({targets: this.riftGlow, alpha: 0.2, scale: 6.2, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut'});
        this.tweens.add({targets: this.riftCore, alpha: 0.75, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut'});
        // A very slow zoom toward the rift, so the screen never looks frozen
        this.tweens.add({targets: this.sky, scale: 1.06, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.inOut'});
    }

    // Golden and purple lights rising slowly from the valley
    makeFireflies(){
        this.fireflies = this.add.particles(0, 0, 'soft-dot', {
            x: {min: 0, max: GAME_WIDTH},
            y: {min: 300, max: GAME_HEIGHT + 20},
            lifespan: {min: 5000, max: 9000},
            speedX: {min: -12, max: 12},
            speedY: {min: -35, max: -12},
            scale: {min: 0.1, max: 0.3},
            alpha: {values: [0, 0.8, 0]},
            tint: [0xffd66b, 0xffe9a8, 0xd2a8ff],
            blendMode: 'ADD',
            frequency: 140,
            advance: 8000,
        });
    }

    makeTitle(){
        this.title = this.add.container(TITLE_X, TITLE_Y);
        this.letters = [];

        // A soft purple haze behind the title, and a glow behind the ruby
        this.haze = this.add.image(0, 10, 'soft-dot').setTint(0x7a3cff).setBlendMode('ADD').setScale(13, 7).setAlpha(0);
        this.gemGlow = this.add.image(0, -205, 'soft-dot').setTint(0xc06bff).setBlendMode('ADD').setScale(0).setAlpha(0.7);
        this.gem = fitInside(this.add.image(0, -205, 'rubis'), 96);
        this.gem.baseY = -205;
        const gemScale = this.gem.scale;
        this.gem.setScale(0);
        this.title.add([this.haze, this.gemGlow, this.gem]);

        this.makeWord('Little', -100, 84, ['#f6eeff', '#c9a7ff'], 2, 300);
        this.makeWord('Hollow', 40, 176, ['#fff6d2', '#ffd66b', '#f39a2b'], 0, 650);

        this.divider = this.add.image(0, 168, 'divider').setScale(0, 1);
        this.dividerGem = fitInside(this.add.image(0, 168, 'rubis'), 26);
        const dividerGemScale = this.dividerGem.scale;
        this.dividerGem.setScale(0);
        this.hint = this.add.text(0, 250, 'Click to enter', textStyle(38, '#f3e8ff')).setOrigin(0.5).setAlpha(0);
        this.title.add([this.divider, this.dividerGem, this.hint]);

        // Entrance: the haze lights up, the ruby pops, the letters drop in, then the line opens and the hint appears
        this.tweens.add({targets: this.haze, alpha: 0.22, duration: 1500});
        this.tweens.add({targets: this.gem, scale: gemScale, duration: 700, delay: 100, ease: 'Back.out'});
        this.tweens.add({targets: this.gemGlow, scale: 3.2, duration: 700, delay: 100, ease: 'Back.out', onComplete: () => {
            this.tweens.add({targets: this.gemGlow, alpha: 0.35, scale: 2.6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut'});
        }});
        this.tweens.add({targets: this.divider, scaleX: 1, duration: 700, delay: 1300, ease: 'Cubic.out'});
        this.tweens.add({targets: this.dividerGem, scale: dividerGemScale, duration: 400, delay: 1500, ease: 'Back.out'});
        this.tweens.add({targets: this.hint, alpha: 1, duration: 500, delay: 1700, onComplete: () => {
            this.tweens.add({targets: this.hint, alpha: 0.35, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut'});
        }});
    }

    // One Text per letter, so each letter can drop in and float on its own
    makeWord(word, y, size, colors, spacing, delay){
        const padding = {x: 8, y: 16};
        const strokeThickness = Math.ceil(size / 8);
        const letters = [...word].map((char) => {
            const letter = this.add.text(0, y, char, {...textStyle(size), padding}).setOrigin(0.5);

            // Vertical gradient, from light at the top to deep at the bottom
            const gradient = letter.context.createLinearGradient(0, padding.y, 0, letter.height - padding.y);
            colors.forEach((color, i) => gradient.addColorStop(i / (colors.length - 1), color));
            letter.setFill(gradient);
            letter.setShadow(0, Math.ceil(size / 18), '#12062a', 0, true, true);
            return letter;
        });

        // Place the letters side by side, the whole word centered on 0
        const advance = (letter) => letter.width - padding.x * 2 - strokeThickness + spacing;
        const total = letters.reduce((sum, letter) => sum + advance(letter), -spacing);
        let x = -total / 2;

        letters.forEach((letter, i) => {
            letter.x = x + advance(letter) / 2;
            x += advance(letter);

            letter.baseY = y;
            letter.lift = -70;
            letter.index = this.letters.length;
            letter.setAlpha(0).setScale(0.4);
            this.tweens.add({targets: letter, lift: 0, alpha: 1, scale: 1, duration: 600, delay: delay + i * 70, ease: 'Back.out'});

            this.letters.push(letter);
            this.title.add(letter);
        });
    }

    twinkle(){
        if (this.entering) return;

        // Most stars shine around the title, the others in the sky
        const nearTitle = Math.random() < 0.6;
        const x = nearTitle ? TITLE_X + Phaser.Math.Between(-380, 380) : Phaser.Math.Between(80, 1100);
        const y = nearTitle ? TITLE_Y + Phaser.Math.Between(-280, 200) : Phaser.Math.Between(40, 520);

        const star = this.add.image(x, y, 'sparkle')
            .setBlendMode('ADD')
            .setTint(Phaser.Utils.Array.GetRandom([0xffffff, 0xffe39a, 0xe2c4ff]))
            .setAngle(Phaser.Math.Between(0, 45))
            .setScale(0);

        this.tweens.add({
            targets: star,
            scale: Phaser.Math.FloatBetween(0.25, 0.6),
            angle: star.angle + 90,
            duration: 500,
            yoyo: true,
            ease: 'Sine.inOut',
            onComplete: () => star.destroy()
        });
    }

    // The player clicked: dive into the rift, timed on the sound
    enter(){
        if (this.entering) return;
        this.entering = true;
        this.input.setDefaultCursor('default');
        this.sound.play('entry-sound', {volume: 0.5});

        // The ruby and the letters are pulled into the rift, one after the other.
        // They aim at where the rift will be on screen while the camera dives (it moves toward the center).
        this.tweens.killTweensOf([...this.letters, this.hint, this.gem, this.gemGlow, this.haze, this.divider, this.dividerGem]);
        const targetX = 650 - this.title.x;
        const targetY = 310 - this.title.y;
        [this.gem, ...this.letters].forEach((item, i) => {
            const delay = i * 30;
            this.tweens.add({
                targets: item,
                x: targetX,
                baseY: targetY,
                scale: item.scale * 0.15,
                rotation: Phaser.Math.FloatBetween(-1.2, 1.2),
                duration: 550,
                delay,
                ease: 'Cubic.in'
            });
            this.tweens.add({targets: item, alpha: 0, duration: 200, delay: delay + 350});
        });
        this.tweens.add({targets: [this.hint, this.gemGlow, this.haze, this.divider, this.dividerGem], alpha: 0, duration: 250});
        this.tweens.add({targets: this.fireflies, alpha: 0, duration: 600});

        // The camera dives into the rift, which grows brighter and pulls its dust in faster and faster
        this.tweens.killTweensOf([this.sky, this.riftGlow, this.riftCore]);
        this.tweens.add({targets: this.sky, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, scale: 3.2, duration: RIFT_OPENS_AT, ease: 'Cubic.in'});
        this.tweens.add({targets: this.riftGlow, scale: 16, alpha: 1, duration: RIFT_OPENS_AT, ease: 'Quad.in'});
        this.tweens.add({targets: this.riftCore, scale: 8, alpha: 1, duration: RIFT_OPENS_AT, ease: 'Quad.in'});
        this.riftDust.setFrequency(8);
        this.cameras.main.shake(RIFT_OPENS_AT, 0.003);

        // The screen turns to light right when the rift opens in the sound, and the game fades in from that light.
        // fade() with force = true, because the fade-in of the title may still be running if the player clicked fast.
        this.time.delayedCall(RIFT_OPENS_AT - 300, () => {
            this.cameras.main.fade(300, RIFT_LIGHT.r, RIFT_LIGHT.g, RIFT_LIGHT.b, true);
        });
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
    }
}
