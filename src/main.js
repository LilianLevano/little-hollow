import Phaser from 'phaser';
import '@fontsource/lilita-one'
import './style.css'

const FONT = 'Lilita One'
const SAVE_KEY = 'little-hollow-save'

const BUILDINGS = [
    {id: 1, name: "farm", icon:"farm", cost: 15, production: 0.2},
    {id: 2, name: "mine", icon:"mine", cost: 50, production: 1.0},
    {id: 3, name: "factory", icon:"factory" , cost: 200, production: 5.0},
    {id: 4, name: "railway", icon:"railway" , cost: 1500, production: 25},
    {id: 5, name: "harbor", icon:"harbor" , cost: 12000, production: 130},
    {id: 6, name: "bank", icon:"bank" , cost: 100000, production: 750},
    {id: 7, name: "laboratory", icon:"laboratory" , cost: 900000, production: 4500},
    {id: 8, name: "observatory", icon:"observatory" , cost: 8500000, production: 28000},
    {id: 9, name: "spaceport", icon:"spaceport" , cost: 85000000, production: 190000},
    {id: 10, name: "hollow rift", icon:"hollow-rift" , cost: 900000000, production: 1300000}
]

const CLICK_UPGRADES = [
    {id: 1, type: "click", target: "clickPower", name: "Gloves", icon: "click-1", cost: 100, multiplier: 2.0, description: "Doubles the amount of points per click."},
    {id: 5, type: "click", target: "clickPower", name: "Iron Knuckles", icon: "click-2", cost: 1500, multiplier: 2.0, description: "Doubles the amount of points per click."},
    {id: 13, type: "click", target: "clickPower", name: "Golden Touch", icon: "click-3", cost: 200000, multiplier: 3.0, description: "Triples the amount of points per click."},
    {id: 19, type: "click", target: "clickPower", name: "Hollow Grip", icon: "click-4", cost: 50000000, multiplier: 5.0, description: "Multiplies the amount of points per click by 5."},
]

const GLOBAL_UPGRADES = [
    {id: 10, type: "global", target: "production", name: "Trade Routes", icon: "global-1", cost: 60000, multiplier: 1.5, description: "Multiplies the production of all buildings by 1.5."},
    {id: 16, type: "global", target: "production", name: "Guild Charter", icon: "global-2", cost: 5000000, multiplier: 1.5, description: "Multiplies the production of all buildings by 1.5."},
    {id: 21, type: "global", target: "production", name: "Golden Age", icon: "global-3", cost: 300000000, multiplier: 2.0, description: "Doubles the production of all buildings."},
    {id: 24, type: "global", target: "production", name: "Hollow Awakening", icon: "global-4", cost: 40000000000, multiplier: 3.0, description: "Triples the production of all buildings."},
]

const FARM_UPGRADES = [
    {id: 2, type: "building", target: 1, name: "Better seeds", icon: "farm-1", cost: 200, multiplier: 2.0, description: "Doubles the amount of points per farm."},
    {id: 6, type: "building", target: 1, unlockAt: 10, name: "Even more seeds!", icon: "farm-2", cost: 2500, multiplier: 2.0, description: "Doubles the amount of points per farm."},
]

const MINE_UPGRADES = [
    {id: 3, type: "building", target: 2, name: "Stone age!", icon: "mine-1", cost: 500, multiplier: 2.0, description: "Doubles the amount of points per mine."},
    {id: 7, type: "building", target: 2, unlockAt: 10, name: "Getting an upgrade!", icon: "mine-2", cost: 6000, multiplier: 2.0, description: "Doubles the amount of points per mine."},
]

const FACTORY_UPGRADES = [
    {id: 4, type: "building", target: 3, name: "Industrialization", icon: "factory-1", cost: 1000, multiplier: 2.0, description: "Doubles the amount of points per factory."},
    {id: 9, type: "building", target: 3, unlockAt: 10, name: "Assembly Lines", icon: "factory-2", cost: 25000, multiplier: 2.0, description: "Doubles the amount of points per factory."},
]

const RAILWAY_UPGRADES = [
    {id: 8, type: "building", target: 4, name: "First station!", icon: "railway-1", cost: 22000, multiplier: 2.0, description: "Doubles the amount of points per railway."},
    {id: 11, type: "building", target: 4, unlockAt: 10, name: "Express Lines", icon: "railway-2", cost: 150000, multiplier: 2.0, description: "Doubles the amount of points per railway."},
]

const HARBOR_UPGRADES = [
    {id: 12, type: "building", target: 5, name: "Only a kayak?", icon: "harbor-1", cost: 180000, multiplier: 2.0, description: "Doubles the amount of points per harbor."},
    {id: 14, type: "building", target: 5, unlockAt: 10, name: "Deep Water Docks", icon: "harbor-2", cost: 1200000, multiplier: 2.0, description: "Doubles the amount of points per harbor."},
]

const BANK_UPGRADES = [
    {id: 15, type: "building", target: 6, name: "The bill collector", icon: "bank-1", cost: 1500000, multiplier: 2.0, description: "Doubles the amount of points per bank."},
    {id: 17, type: "building", target: 6, unlockAt: 10, name: "Offshore Accounts", icon: "bank-2", cost: 10000000, multiplier: 2.0, description: "Doubles the amount of points per bank."},
]

const LABORATORY_UPGRADES = [
    {id: 18, type: "building", target: 7, name: "What's cooking?", icon: "lab-1", cost: 13000000, multiplier: 2.0, description: "Doubles the amount of points per laboratory."},
]

const OBSERVATORY_UPGRADES = [
    {id: 20, type: "building", target: 8, name: "Looking at the stars", icon: "obs-1", cost: 130000000, multiplier: 2.0, description: "Doubles the amount of points per observatory."},
]

const SPACEPORT_UPGRADES = [
    {id: 22, type: "building", target: 9, name: "Making contact with... ?", icon: "sp-1", cost: 1300000000, multiplier: 2.0, description: "Doubles the amount of points per spaceport."},
]

const HOLLOW_RIFT_UPGRADES = [
    {id: 23, type: "building", target: 10, name: "How did we get there?", icon: "hr-1", cost: 13000000000, multiplier: 2.0, description: "Doubles the amount of points per hollow rift."},
]

const BUILDING_UPGRADES = [...FARM_UPGRADES, ...MINE_UPGRADES, ...FACTORY_UPGRADES, ...RAILWAY_UPGRADES, ...HARBOR_UPGRADES, ...BANK_UPGRADES, ...LABORATORY_UPGRADES, ...OBSERVATORY_UPGRADES, ...SPACEPORT_UPGRADES, ...HOLLOW_RIFT_UPGRADES]

const UPGRADES = [...CLICK_UPGRADES, ...GLOBAL_UPGRADES, ...BUILDING_UPGRADES].sort((a, b) => a.cost - b.cost)

const MAX_VISIBLE_UPGRADES = 8

const TILE_SIZE = 72
const TILE_GAP = 12
const UPGRADES_Y = 60
const BUILDINGS_Y = 170
const BUILDING_ROW_HEIGHT = 84

const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

const PLAY_AREA_X = 500;
const SHOP_X = 1012;
const SHOP_WIDTH = 880;

const compactNumber = new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 2})

function formatNumber(value){
    return value < 1000000 ? `${Math.floor(value)}` : compactNumber.format(value)
}

function getInitials(name){
    return name.split(' ').slice(0, 2).map(word => word[0].toUpperCase()).join('')
}

export default class MainScene extends Phaser.Scene{
    constructor(){
        super('GameScene');
    }

    preload(){

        const ASSETS = 'assets/optimized'

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


        this.score = 0;
        this.buildings = BUILDINGS.map(b => ({...b, count: 0}));
        this.upgrades = UPGRADES.map(u => ({...u, bought: false})).sort((a, b) => a.cost - b.cost);

        this.loadGame();

        const width = GAME_WIDTH;
        const height = GAME_HEIGHT;

        this.scoreText = this.add.text(width * 0.15, height * 0.15, 'Score: 0', {fontSize: '48px', color: '#ffffff'}).setOrigin(0.5);
        this.makeClickButton(width, height);

        this.resetButton = this.add.text(width * 0.15, height * 0.85, 'Reset Game', {fontSize: '32px', color: '#ffffff'}).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            localStorage.removeItem(SAVE_KEY)
            this.scene.restart()
        })

        

        this.buildings.forEach((building, index) => {
            this.makeBuildingRow(building, index)
        })

        this.upgrades.forEach((upgrade) => {
            this.makeUpgradeTile(upgrade)
        })

        this.tooltip = this.add.text(SHOP_X - 20, 0, '', {fontSize: '28px', color: '#ffffff', backgroundColor: '#11111b', padding: {x: 16, y: 12}, wordWrap: {width: 480}}).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.layoutUpgrades()

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => this.saveGame()
        });
    }

    makeClickButton(width, height){
        this.clickButton = this.add.image(width * 0.15, height * 0.50, 'click-image').setScale(0.3).setAlpha(0.8).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.addScore(this.getClickPower());
        })
    }

    makeTile(x, y, text){
        const background = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0x45475a).setOrigin(0);
        const initials = this.add.text(TILE_SIZE / 2, TILE_SIZE / 2, text, {fontSize: '32px', color: '#ffffff'}).setOrigin(0.5);
        return {background, tile: this.add.container(x, y, [background, initials])};
    }

    makeBuildingRow(building, index){
        const y = BUILDINGS_Y + index * BUILDING_ROW_HEIGHT;
        const rowBackground = this.add.rectangle(0, 0, SHOP_WIDTH, TILE_SIZE, 0x313244).setOrigin(0);
        const {tile} = this.makeTile(0, 0, getInitials(building.name));
        const name = this.add.text(TILE_SIZE + TILE_GAP, TILE_SIZE / 2, building.name, {fontSize: '32px', color: '#ffffff'}).setOrigin(0, 0.5);
        building.countText = this.add.text(SHOP_WIDTH - TILE_GAP, TILE_SIZE / 2, `${building.count}`, {fontSize: '40px', color: '#ffffff'}).setOrigin(1, 0.5);
        building.row = this.add.container(SHOP_X, y, [rowBackground, tile, name, building.countText]);

        this.addHover(rowBackground, y, () => this.getBuildingInfo(building)).on('pointerdown', () => {
            this.buyBuilding(building)
        })
    }

    makeUpgradeTile(upgrade){
        const {background, tile} = this.makeTile(SHOP_X, UPGRADES_Y, getInitials(upgrade.name));
        upgrade.tile = tile.setVisible(false);

        this.addHover(background, UPGRADES_Y, () => this.getUpgradeInfo(upgrade)).on('pointerdown', () => {
            this.buyUpgrade(upgrade)
        })
    }

    addHover(target, tooltipY, getInfo){
        return target.setInteractive()
            .on('pointerover', () => this.showTooltip(tooltipY, getInfo))
            .on('pointerout', () => this.hideTooltip())
    }

    showTooltip(y, getInfo){
        this.tooltipY = y;
        this.tooltipInfo = getInfo;
        this.tooltip.setVisible(true);
        this.updateTooltip();
    }

    hideTooltip(){
        this.tooltipInfo = null;
        this.tooltip.setVisible(false);
    }

    updateTooltip(){
        if (!this.tooltipInfo) return;
        this.tooltip.setText(this.tooltipInfo());
        this.tooltip.setY(Math.min(this.tooltipY, GAME_HEIGHT - this.tooltip.height - 20));
    }

    getBuildingInfo(building){
        const each = this.getBuildingProduction(building);
        return [
            building.name,
            `Owned: ${building.count}`,
            `Cost: ${formatNumber(this.getCost(building))} points`,
            `Each: ${compactNumber.format(each)} points/s`,
            `Total: ${compactNumber.format(each * building.count)} points/s`
        ].join('\n');
    }

    getUpgradeInfo(upgrade){
        return [
            upgrade.name,
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
            this.layoutUpgrades()
        }
    }

    buyUpgrade(upgrade){
        if (upgrade.bought) return;
        if (this.score < upgrade.cost) return;
        this.addScore(-upgrade.cost);
        upgrade.bought = true;
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
        this.scoreText.setText(`Score: ${formatNumber(this.score)}`)
    }
    
    updateShopState(){
        for(const building of this.buildings){
            building.row.setAlpha(this.score >= this.getCost(building) ? 1 : 0.5)
            building.countText.setText(`${building.count}`)
        }
        for(const upgrade of this.upgrades){
            upgrade.tile.setAlpha(this.score >= upgrade.cost ? 1 : 0.5)
        }
    }

    isUpgradeAvailable(upgrade){
        if (upgrade.bought) return false;
        if (upgrade.type !== "building") return true;
        return this.findBuildingById(upgrade.target).count >= (upgrade.unlockAt ?? 1);
    }

    layoutUpgrades(){
        const shown = this.upgrades.filter(u => this.isUpgradeAvailable(u)).slice(0, MAX_VISIBLE_UPGRADES);
        let x = SHOP_X;
        for (const upgrade of this.upgrades){
            if (!shown.includes(upgrade)){
                upgrade.tile.setVisible(false);
            } else {
                if (upgrade.tile.visible){
                    this.tweens.add({targets: upgrade.tile, x: x, duration: 200});
                } else {
                    upgrade.tile.setX(x).setVisible(true);
                }
                x += TILE_SIZE + TILE_GAP;
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

    update(time, delta){
        let totalProduction = 0;

        const elapsedTime = delta / 1000

        for (const building of this.buildings) {
            totalProduction += building.count * this.getBuildingProduction(building)
        }

        this.addScore(totalProduction * elapsedTime)
        this.refreshUi();
  
    }

    saveGame(){
        const save = {
            version: 2,
            score: this.score,
            buildings: this.buildings.map(building => ({id: building.id, count: building.count})),
            upgrades: this.upgrades.filter(u => u.bought).map(u => u.id)
        }

        localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    }

    loadGame(){

        let save;

        try{
            save =  JSON.parse(localStorage.getItem(SAVE_KEY))
            if(save == null){
                return
            }
        }catch(err){
            console.warn(`Faulty save (${err})`)
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

const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#1e1e2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene:  [MainScene],
}

document.fonts.load(`32px "${FONT}"`).finally(() => {
    new Phaser.Game(config);
});