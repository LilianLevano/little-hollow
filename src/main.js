import Phaser from 'phaser';
import './style.css'

const SAVE_KEY = 'little-hollow-save'

const BUILDINGS = [
    {id: 1, name: "farm", cost: 15, production: 0.2},
    {id: 2, name: "mine", cost: 50, production: 1.0},
    {id: 3, name: "factory", cost: 200, production: 5.0}
]

const UPGRADES = [
    {id: 1, type: "click", target: "clickPower", name: "Gloves", cost: 100, multiplier: 2.0, description: "Doubles the amount of points per click."},
    {id: 2, type: "building", target: 1, name: "Better seeds", cost: 200, multiplier: 2.0, description: "Doubles the amount of points per farm."},
    {id: 3, type: "building", target: 2, name: "Getting an Upgrade!", cost: 500, multiplier: 2.0, description: "Doubles the amount of points per mine."},
    {id: 4, type: "building", target: 3, name: "Industrialization", cost: 1000, multiplier: 2.0, description: "Doubles the amount of points per factory."}
]



export default class MainScene extends Phaser.Scene{
    constructor(){
            super('GameScene');
    }

    preload(){
        this.load.image('click-image', 'assets/clic-button.png')
    }

    create(){

        this.score = 0;
        this.buildings = BUILDINGS.map(b => ({...b, count: 0}));
        this.upgrades = UPGRADES.map(u => ({...u, bought: false}));

        this.loadGame();

        const {width, height} = this.scale;
        this.scoreText = this.add.text(width * 0.15, height * 0.15, 'Score: 0', {fontSize: '48px', color: '#ffffff'}).setOrigin(0.5);
        this.makeClickButton(width, height);

        this.resetButton = this.add.text(width * 0.15, height * 0.85, 'Reset Game', {fontSize: '32px', color: '#ffffff'}).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            localStorage.removeItem(SAVE_KEY)
            this.scene.restart()
        })

        this.buildings.forEach((building, index) => {
            building.label = this.add.text(width * 0.65, height * 0.25 + index * 50, `${building.name}(${building.count}), cost: ${this.getCost(building)} points`, {fontSize: '32px', color: '#ffffff'}).setOrigin(0, 0.5).setInteractive().on('pointerdown', () => {
                this.buyBuilding(building)
            })
        })

        this.upgrades.forEach((upgrade, index) => {
            upgrade.label = this.add.text(width * 0.65, height * 0.55 + index * 50, `${upgrade.name}, cost: ${upgrade.cost} points`, {fontSize: '32px', color: '#ffffff', wordWrap: {width: 600}}).setOrigin(0, 0).setInteractive().on('pointerdown', () => {
                this.buyUpgrade(upgrade)
            })
        })

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
        }
    }

    buyUpgrade(upgrade){
        if (upgrade.bought) return;
        if (this.score < upgrade.cost) return;
        this.addScore(-upgrade.cost);
        upgrade.bought = true;
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
        }
        return production;
    }

    updateScoreText(){
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`)
    }
    
    updateBuildingText(){
        for(const building of this.buildings){
            building.label.setText(`${building.name}(${building.count}), cost: ${this.getCost(building)} points`)
        }
    }

    updateUpgradeText(){
        for(const upgrade of this.upgrades){
            upgrade.label.setText(`${upgrade.name}, cost: ${upgrade.cost} points`)
        }
    }

    layoutUpgrades(){
        const {height} = this.scale;
        let y = height * 0.55;
        for (const upgrade of this.upgrades){
            if (upgrade.bought){
                upgrade.label.setVisible(false);
            } else {
                upgrade.label.setVisible(true);
                this.tweens.add({targets: upgrade.label, y: y, duration: 200});
                y += upgrade.label.height + 15;
            }
        }
    }

    findBuildingById(buildingId) {
        return this.buildings.find(b => b.id === buildingId);
    }

    refreshUi(){
        this.updateBuildingText()
        this.updateScoreText()
        this.updateUpgradeText()
      
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
    width: 1920,
    height: 1080,
    backgroundColor: '#1e1e2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene:  [MainScene],
}


new Phaser.Game(config);