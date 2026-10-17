import Phaser from 'phaser';
import './style.css'

const SAVE_KEY = 'little-hollow-save'



export default class MainScene extends Phaser.Scene{
    constructor(){
            super('GameScene');

    }

    preload(){
        this.load.image('click-image', 'assets/clic-button.png')
    }

    create(){

        this.score = 0;
        this.buildings = [{id: 1, name: "farm", cost: 15, production: 0.2, count: 0}]
        this.clickPower = 1;

        this.loadGame();

        const {width, height} = this.scale;
        this.scoreText = this.add.text(width * 0.15, height * 0.15, 'Score: 0', {fontSize: '48px', color: '#ffffff'}).setOrigin(0.5);
        this.makeClickButton(width, height);

        this.farm = this.add.text(width * 0.70, height * 0.20, null,  {fontSize: '30px'} ).setInteractive({useHandCursor: true}).on('pointerdown', () =>{
            this.buyBuilding(this.buildings[0])

        })

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => this.saveGame()
        });
    }

    makeClickButton(width, height){
        this.clickButton = this.add.image(width * 0.15, height * 0.50, 'click-image').setScale(0.3).setAlpha(0.8).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.addScore(this.clickPower);
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

    updateScoreText(){
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`)
    }
    
    updateBuildingText(){
        this.farm.setText(`Farm(${this.buildings[0].count}), cost: ${this.getCost(this.buildings[0])} points`)
    }

    findBuildingById(buildingId) {
        return this.buildings.find(b => b.id === buildingId);
    }

    refreshUi(){
        this.updateBuildingText()
        this.updateScoreText()
    }

    update(time, delta){
        let totalProduction = 0;

        const elapsedTime = delta / 1000

        for (const building of this.buildings) {
            totalProduction += building.count * building.production
        }

        this.addScore(totalProduction * elapsedTime)
        this.refreshUi();
  
    }

    saveGame(){
        const save = {
            version: 1,
            score: this.score,
            clickPower: this.clickPower,
            buildings: this.buildings.map(building => ({id: building.id, count: building.count}))
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
        this.clickPower = save.clickPower ?? 1

        for (const savedBuilding of save.buildings) {

            const buildingToRestore = this.findBuildingById(savedBuilding.id)

            if(buildingToRestore == null){
                continue
            }
            buildingToRestore.count = savedBuilding.count
         

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