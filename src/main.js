import Phaser from 'phaser';
import './style.css'


export default class MainScene extends Phaser.Scene{
    constructor(){
            super('GameScene');
            this.score = 0;
            this.buildings = [{id: 1, name: "farm", cost: 15, production: 0.2, owned: 0}]
    }

    preload(){
        this.load.image('click-image', 'assets/clic-button.png')
    }

    create(){
        const {width, height} = this.scale;
        this.scoreText = this.add.text(width * 0.15, height * 0.15, 'Score: 0', {fontSize: '48px', color: '#ffffff'}).setOrigin(0.5);
        this.makeClickButton(width, height);
        this.updateScoreText()


        this.farm = this.add.text(width * 0.70, height * 0.20, null,  {fontSize: '30px'} ).setInteractive({useHandCursor: true}).on('pointerdown', () =>{
            this.buyBuilding(this.buildings[0])
            this.updateBuildingText();
        })
        this.updateBuildingText();
    }

    makeClickButton(width, height){
        this.clickButton = this.add.image(width * 0.15, height * 0.50, 'click-image').setScale(0.3).setAlpha(0.8).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.addScore(1);
        })
    }

    addScore(amount){
        this.score += amount
        this.updateScoreText();
    }

    getCost(building){
        return Math.floor(building.cost * 1.15**building.owned) 
    }

    buyBuilding(building){
        const cost = this.getCost(building)

        if (this.score >= cost) {
            this.addScore(-cost);
            building.owned++;
        }
    }

    updateScoreText(){
        this.scoreText.setText(`Score:  ${Math.floor(this.score)}`)
    }
    
    updateBuildingText(){
        this.farm.setText(`Farm(${this.buildings[0].owned}), cost: ${this.getCost(this.buildings[0])} points`)
    }

    refreshUi(){
        this.updateBuildingText()
        this.updateScoreText()
    }

    update(time, delta){
        let totalProduction = 0;

        const elapsedTime = delta / 1000

        for (const building of this.buildings) {
            totalProduction += building.owned * building.production
        }

        this.addScore(totalProduction * elapsedTime)
        this.refreshUi();

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