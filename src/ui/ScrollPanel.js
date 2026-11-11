import Phaser from 'phaser';
import {GAME_HEIGHT, SCROLL_FADE} from '../constants.js';

// A window on a list that is taller than the room it gets on screen (the shop cards, the village rows).
// Add the items to `content` where they would be without scrolling (the first one at the top of the window),
// then tell the panel how tall the list is with setContentHeight().
// The list scrolls with the mouse wheel or the arrows. Near an edge with hidden items, the items fade out
// and an arrow shows that there is more to see.
export default class ScrollPanel{
    constructor(scene, x, y, width, height, step, {blockOutside = false} = {}){
        this.scene = scene;
        this.area = new Phaser.Geom.Rectangle(x, y, width, height);
        this.step = step;           // how far one click on an arrow scrolls
        this.scroll = 0;            // how many pixels of the list are hidden above the window, once the slide is over
        this.contentHeight = 0;

        this.content = scene.add.container(0, 0);

        // The content is only drawn where this shape is drawn, and fades where the shape fades (see drawMask).
        // The mask is only redrawn when the shape changes, not every frame.
        this.maskShape = scene.make.graphics();
        this.mask = this.content.enableFilters().filters.external.addMask(this.maskShape);
        this.mask.autoUpdate = false;

        // The mask only hides things, the pointer still reaches them: these invisible zones above and below
        // the window catch it, so hidden items can't be hovered or clicked. Things created later stay on top of them.
        if (blockOutside){
            scene.add.zone(x, 0, width, y).setOrigin(0).setInteractive();
            scene.add.zone(x, y + height, width, GAME_HEIGHT - y - height).setOrigin(0).setInteractive();
        }

        this.upArrow = this.makeArrow(x + width / 2, y + 26, -1);
        this.downArrow = this.makeArrow(x + width / 2, y + height - 26, 1);

        scene.input.on('wheel', (pointer, over, deltaX, deltaY) => {
            if (this.area.contains(pointer.worldX, pointer.worldY)){
                this.scrollTo(this.scroll + deltaY);
            }
        });

        this.refresh();
    }

    // A round button with a triangle pointing up (direction -1) or down (1). It bobs gently to catch the eye.
    makeArrow(x, y, direction){
        const shape = this.scene.add.graphics()
            .fillStyle(0x1a0f2e, 0.9).fillCircle(0, 0, 20)
            .lineStyle(3, 0xffd66b).strokeCircle(0, 0, 20)
            .fillStyle(0xffd66b).fillTriangle(-9, -5 * direction, 9, -5 * direction, 0, 7 * direction);

        const arrow = this.scene.add.container(x, y, [shape]).setSize(44, 44)
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => this.scrollTo(this.scroll + direction * this.step))
            .on('pointerover', () => arrow.setScale(1.15))
            .on('pointerout', () => arrow.setScale(1));

        this.scene.tweens.add({targets: arrow, y: y + direction * 5, duration: 600, ease: 'Sine.inOut', yoyo: true, repeat: -1});
        return arrow;
    }

    getMaxScroll(){
        return Math.max(0, this.contentHeight - this.area.height);
    }

    // Tells the panel how tall the list is, from the top of the window to the bottom of its last item
    setContentHeight(height){
        this.contentHeight = height;
        if (this.scroll > this.getMaxScroll()){
            this.scrollTo(this.scroll);
        }
        this.refresh();
    }

    // Slides the content so that `value` pixels of the list are hidden above the window, without going past either end
    scrollTo(value){
        this.scroll = Phaser.Math.Clamp(value, 0, this.getMaxScroll());
        this.scene.tweens.killTweensOf(this.content);
        this.scene.tweens.add({
            targets: this.content,
            y: -this.scroll,
            duration: 160,
            ease: 'Cubic.out',
            onUpdate: () => this.refresh(),
            onComplete: () => this.refresh(),
        });
    }

    // Shows each arrow, and fades each edge, only while some of the list is hidden behind it
    refresh(){
        const hiddenAbove = -this.content.y;
        const hiddenBelow = this.getMaxScroll() + this.content.y;
        this.upArrow.setVisible(hiddenAbove > 1);
        this.downArrow.setVisible(hiddenBelow > 1);
        this.drawMask(hiddenAbove, hiddenBelow);
    }

    // The mask is opaque in the middle of the window. On an edge with hidden items, it turns into a gradient
    // that fades the items out as they get close to that edge. The fade grows over the first pixels of
    // scrolling, so it never pops in.
    drawMask(hiddenAbove, hiddenBelow){
        const {x, y, width, height} = this.area;
        const topAlpha = 1 - Math.min(hiddenAbove, SCROLL_FADE) / SCROLL_FADE;
        const bottomAlpha = 1 - Math.min(hiddenBelow, SCROLL_FADE) / SCROLL_FADE;
        const white = 0xffffff;

        this.maskShape.clear()
            .fillGradientStyle(white, white, white, white, topAlpha, topAlpha, 1, 1)
            .fillRect(x, y, width, SCROLL_FADE)
            .fillStyle(white, 1)
            .fillRect(x, y + SCROLL_FADE, width, height - SCROLL_FADE * 2)
            .fillGradientStyle(white, white, white, white, 1, 1, bottomAlpha, bottomAlpha)
            .fillRect(x, y + height - SCROLL_FADE, width, SCROLL_FADE);
        this.mask.needsUpdate = true;
    }
}
