import Phaser from 'phaser';
import './style.css'


export default class MainScene extends Phaser.Scene{
    constructor(){
            super('GameScene');
            this.score = 0;
    }


    preload(){
        this.load.image('click-image', 'assets/clic-button.png')
    }

    create(){
        const {width, height} = this.scale;
        this.scoreText = this.add.text(width * 0.15, height * 0.15, 'Score: 0', {fontSize: '48px', color: '#ffffff'}).setOrigin(0.5);
        this.makeClickButton(width, height);
        this.updateScoreText()
    }

    addScore(amount){
        this.score += amount
        this.updateScoreText();
    }

    updateScoreText(){
        this.scoreText.setText(`Score: ${this.score}`)
    }

    makeClickButton(width, height){
        this.clickButton = this.add.image(width * 0.15, height * 0.50, 'click-image').setScale(0.3).setAlpha(0.8).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.addScore(1);

        })
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