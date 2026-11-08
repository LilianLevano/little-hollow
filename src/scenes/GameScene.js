import Phaser from 'phaser';
import {BUILDINGS} from '../data/buildings.js';
import {UPGRADES} from '../data/upgrades.js';
import {formatNumber, compactNumber, capitalize, textStyle, fitInside} from '../utils.js';
import {writeSave, readSave, deleteSave} from '../save.js';
import {
    ASSETS, GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE,
    PLAY_AREA_X, SCORE_FRAME_Y, CLICK_BUTTON_SCALE,
    SHOP_X, HOVER_SCALE,
    MAX_VISIBLE_UPGRADES, UPGRADES_Y, UPGRADE_SIZE, UPGRADE_GAP,
    BUILDINGS_Y, CARD_GAP, CARD_WIDTH, CARD_HEIGHT,
    TOOLTIP_WIDTH, TOOLTIP_MIN_Y, TOOLTIP_LEFT,
} from '../constants.js';

export default class GameScene extends Phaser.Scene{
    constructor(){
        super('GameScene');
    }

    preload(){
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
    }

    create(){

        this.cameras.main.setZoom(RENDER_SCALE).centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);

        this.background = this.add.image(0, 0, 'background').setOrigin(0);
        this.background.setScale(Math.max(GAME_WIDTH / this.background.width, GAME_HEIGHT / this.background.height));

        this.score = 0;
        this.buildings = BUILDINGS.map(b => ({...b, count: 0}));
        this.upgrades = UPGRADES.map(u => ({...u, bought: false})).sort((a, b) => a.cost - b.cost);

        this.loadGame();

        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;

        this.add.image(PLAY_AREA_X, SCORE_FRAME_Y, 'score-contour').setScale(0.5);
        fitInside(this.add.image(PLAY_AREA_X - 196, SCORE_FRAME_Y + 6, 'rubis'), 72);
        this.scoreText = this.add.text(PLAY_AREA_X, SCORE_FRAME_Y + 6, `0`, textStyle(56, '#ffd66b')).setOrigin(0.5);
        this.totalProductionText = this.add.text(PLAY_AREA_X, SCORE_FRAME_Y + 134, `0 points/s`, textStyle(32)).setOrigin(0.5);
        this.makeClickButton();

        this.resetButton = this.add.text(width * 0.15, height * 0.85, 'Reset Game', {fontSize: '32px', color: '#ffffff'}).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            deleteSave()
            this.scene.restart()
        })

        this.buildings.forEach((building, index) => {
            this.makeBuildingRow(building, index)
        })

        this.upgrades.forEach((upgrade) => {
            this.makeUpgradeTile(upgrade)
        })

        this.tooltipFrame = this.add.image(SHOP_X - 12, 0, 'building-contour').setOrigin(1, 0).setDepth(10).setVisible(false);
        this.tooltipIcon = this.add.image(TOOLTIP_LEFT + 104, 0, 'rubis').setDepth(10).setVisible(false);
        this.tooltip = this.add.text(TOOLTIP_LEFT + 176, 0, '', {...textStyle(26), wordWrap: {width: 388}}).setDepth(10).setVisible(false);

        // Small rubies that burst out on clicks and purchases. Nothing is emitted until explode() is called.
        this.particles = this.add.particles(0, 0, 'rubis', {
            speed: {min: 160, max: 420},
            angle: {min: 200, max: 340}, // upwards, in a fan
            scale: {start: 0.22, end: 0},
            gravityY: 800,
            lifespan: 650,
            emitting: false,
        }).setDepth(5);

        this.layoutUpgrades()

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => this.saveGame()
        });
    }

    makeClickButton(){
        const hitArea = new Phaser.Geom.Circle(470, 430, 380);

        this.clickButton = this.add.image(PLAY_AREA_X, 610, 'click-image').setScale(CLICK_BUTTON_SCALE)
            .setInteractive({hitArea, hitAreaCallback: Phaser.Geom.Circle.Contains, useHandCursor: true})
            .on('pointerdown', (pointer) => {
                const gain = this.getClickPower();
                this.addScore(gain);
                this.playClickEffects(pointer, gain);
            })
    }

    playClickEffects(pointer, gain){
        // The button sinks a little, then springs back to its size
        this.tweens.killTweensOf(this.clickButton);
        this.clickButton.setScale(CLICK_BUTTON_SCALE * 0.94);
        this.tweens.add({targets: this.clickButton, scale: CLICK_BUTTON_SCALE, duration: 180, ease: 'Back.out'});

        // A few rubies where the player clicked
        this.particles.explode(4, pointer.worldX, pointer.worldY);

        // "+N" rises and fades out, then is removed
        const gainText = this.add.text(pointer.worldX, pointer.worldY - 30, `+${formatNumber(gain)}`, textStyle(42, '#ffd66b')).setOrigin(0.5).setDepth(5);
        this.tweens.add({
            targets: gainText,
            y: gainText.y - 110,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.out',
            onComplete: () => gainText.destroy()
        });
    }

    makeBuildingRow(building, index){
        const column = index % 2;
        const line = Math.floor(index / 2);
        const x = SHOP_X + CARD_WIDTH / 2 + column * (CARD_WIDTH + CARD_GAP);
        const y = BUILDINGS_Y + CARD_HEIGHT / 2 + line * (CARD_HEIGHT + CARD_GAP);
        const left = -CARD_WIDTH / 2;

        const frame = this.add.image(0, 0, 'building-contour').setDisplaySize(CARD_WIDTH, CARD_HEIGHT);
        const image = fitInside(this.add.image(left + 76 , -2, building.icon), 122);
        const name = this.add.text(left + 146, -40, capitalize(building.name), textStyle(32))
        const rubis = fitInside(this.add.image(left + 158, 20, 'rubis'), 30)
        building.costText = this.add.text(left + 176, 20, '', textStyle(26, '#ffd66b')).setOrigin(0, 0.5);
        building.countText = this.add.text(-left - 34, 0, '', textStyle(46)).setOrigin(1, 0.5);

        const hitArea = this.add.zone(0, 0, CARD_WIDTH, CARD_HEIGHT);

        building.row = this.add.container(x, y, [frame, image, name, rubis, building.costText, building.countText, hitArea]);

        this.addHover(hitArea, y - CARD_HEIGHT / 2, () => this.getBuildingInfo(building), building.icon).on('pointerdown', () => {
            this.buyBuilding(building)
        })
    }

    makeUpgradeTile(upgrade){
        const frame = this.add.image(0, 0, 'upgrade-contour').setOrigin(0.5, 0.46).setScale(0.468);
        const icon = fitInside(this.add.image(0, 0, upgrade.icon), UPGRADE_SIZE * 0.72);
        const hitArea = this.add.zone(0, 0, UPGRADE_SIZE, UPGRADE_SIZE);

        upgrade.tile = this.add.container(SHOP_X, UPGRADES_Y + UPGRADE_SIZE / 2, [frame, icon, hitArea]).setVisible(false);

        this.addHover(hitArea, UPGRADES_Y, () => this.getUpgradeInfo(upgrade), upgrade.icon).on('pointerdown', () => {
            this.buyUpgrade(upgrade)
        })
    }

    addHover(target, tooltipY, getInfo, icon){
        // target is inside a card or a tile: parentContainer is that card, which grows a little on hover
        return target.setInteractive({useHandCursor: true})
            .on('pointerover', () => {
                target.parentContainer.setScale(HOVER_SCALE);
                this.showTooltip(tooltipY, getInfo, icon);
            })
            .on('pointerout', () => {
                target.parentContainer.setScale(1);
                this.hideTooltip();
            })
    }

    showTooltip(y, getInfo, icon){
        this.tooltipY = y;
        this.tooltipInfo = getInfo;
        this.tooltipIcon.setTexture(icon);
        fitInside(this.tooltipIcon, 96);
        this.tooltipIcon.setVisible(true);
        this.tooltip.setVisible(true);
        this.tooltipFrame.setVisible(true);
        this.updateTooltip();
    }

    hideTooltip(){
        this.tooltipInfo = null;
        this.tooltip.setVisible(false);
        this.tooltipFrame.setVisible(false);
        this.tooltipIcon.setVisible(false);
    }

    updateTooltip(){
        if (!this.tooltipInfo) return;
        this.tooltip.setText(this.tooltipInfo());
        const frameHeight = this.tooltip.height + 96;
        const y = Math.min(Math.max(this.tooltipY, TOOLTIP_MIN_Y), GAME_HEIGHT - frameHeight - 20);
        this.tooltipFrame.setY(y).setDisplaySize(TOOLTIP_WIDTH, frameHeight);
        this.tooltip.setY(y + 48);
        this.tooltipIcon.setY(y + frameHeight / 2);
    }

    getBuildingInfo(building){
        const each = this.getBuildingProduction(building);
        return [
            capitalize(building.name),
            `Owned: ${building.count}`,
            `Cost: ${formatNumber(this.getCost(building))} points`,
            `Each: ${compactNumber.format(each)} points/s`,
            `Total: ${compactNumber.format(each * building.count)} points/s`
        ].join('\n');
    }

    getUpgradeInfo(upgrade){
        return [
            capitalize(upgrade.name),
            `Cost: ${formatNumber(upgrade.cost)} points`,
            upgrade.description
        ].join('\n');
    }

    addScore(amount){
        this.score += amount
    }

    getCost(building){
        return Math.floor(building.cost * 1.15**building.count)
    }

    buyBuilding(building){
        const cost = this.getCost(building)

        if (this.score >= cost) {
            this.addScore(-cost);
            building.count++;
            this.particles.explode(8, building.row.x, building.row.y);
            this.layoutUpgrades()
        }
    }

    buyUpgrade(upgrade){
        if (upgrade.bought) return;
        if (this.score < upgrade.cost) return;
        this.addScore(-upgrade.cost);
        upgrade.bought = true;
        this.particles.explode(8, upgrade.tile.x, upgrade.tile.y);
        this.hideTooltip()
        this.layoutUpgrades()
    }

    getClickPower(){
        let power = 1;
        for (const u of this.upgrades){
            if (u.bought && u.type === "click") power *= u.multiplier;
        }
        return power;
    }

    getBuildingProduction(building){
        let production = building.production;
        for (const u of this.upgrades){
            if (u.bought && u.type === "building" && u.target === building.id) production *= u.multiplier;
            if (u.bought && u.type === "global") production *= u.multiplier;
        }
        return production;
    }

    updateScoreText(){
        this.scoreText.setText(`${formatNumber(this.score)}`)
        this.totalProductionText.setText(`${compactNumber.format(this.getTotalProduction())} points/s`)
    }

    updateShopState(){
        for(const building of this.buildings){
            const cost = this.getCost(building);
            building.row.setAlpha(this.score >= cost ? 1 : 0.6)
            building.costText.setText(formatNumber(cost))
            building.countText.setText(`${building.count}`)
        }
        for(const upgrade of this.upgrades){
            upgrade.tile.setAlpha(this.score >= upgrade.cost ? 1 : 0.6)
        }
    }

    isUpgradeAvailable(upgrade){
        if (upgrade.bought) return false;
        if (upgrade.type !== "building") return true;
        return this.findBuildingById(upgrade.target).count >= (upgrade.unlockAt ?? 1);
    }

    layoutUpgrades(){
        const shown = this.upgrades.filter(u => this.isUpgradeAvailable(u)).slice(0, MAX_VISIBLE_UPGRADES);
        let x = SHOP_X + UPGRADE_SIZE / 2;
        for (const upgrade of this.upgrades){
            if (!shown.includes(upgrade)){
                upgrade.tile.setVisible(false);
            } else {
                if (upgrade.tile.visible){
                    this.tweens.add({targets: upgrade.tile, x: x, duration: 200});
                } else {
                    upgrade.tile.setX(x).setVisible(true);
                }
                x += UPGRADE_SIZE + UPGRADE_GAP;
            }
        }
    }

    findBuildingById(buildingId) {
        return this.buildings.find(b => b.id === buildingId);
    }

    refreshUi(){
        this.updateScoreText()
        this.updateShopState()
        this.updateTooltip()
    }

    getTotalProduction(){
        let totalProduction = 0;
        for (const building of this.buildings) {
            totalProduction += building.count * this.getBuildingProduction(building)
        }
        return totalProduction
    }

    update(time, delta){
        const elapsedTime = delta / 1000;
        this.addScore(this.getTotalProduction() * elapsedTime)
        this.refreshUi();
    }

    saveGame(){
        writeSave({
            version: 2,
            score: this.score,
            buildings: this.buildings.map(building => ({id: building.id, count: building.count})),
            upgrades: this.upgrades.filter(u => u.bought).map(u => u.id)
        })
    }

    loadGame(){
        const save = readSave()
        if (save == null){
            return
        }

        this.score = save.score ?? this.score

        for (const savedBuilding of save.buildings) {
            const buildingToRestore = this.findBuildingById(savedBuilding.id)

            if(buildingToRestore == null){
                continue
            }
            buildingToRestore.count = savedBuilding.count
        }

        for (const savedUpgradeId of save.upgrades ?? []) {
            const upgradeToRestore = this.upgrades.find(u => u.id === savedUpgradeId)
            if (upgradeToRestore) {
                upgradeToRestore.bought = true
            }
        }
    }
}
