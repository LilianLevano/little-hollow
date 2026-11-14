import Phaser from "phaser";

import { ASSETS, GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE } from "../constants.js";
import { BUILDINGS } from "../data/buildings.js";
import { UPGRADES } from "../data/upgrades.js";
import { textStyle } from "../utils.js";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("click-image", `${ASSETS}/clic-button.png`);
    this.load.image("background", `${ASSETS}/background.webp`);
    this.load.image("building-contour", `${ASSETS}/building-contour.png`);
    this.load.image("upgrade-contour", `${ASSETS}/upgrade-contour.png`);
    this.load.image("rubis", `${ASSETS}/rubis.png`);
    this.load.image("score-contour", `${ASSETS}/score-contour.png`);

    for (const building of BUILDINGS) {
      this.load.image(
        building.icon,
        `${ASSETS}/buildings/${building.icon}.png`,
      );
    }

    for (const upgrade of UPGRADES) {
      this.load.image(upgrade.icon, `${ASSETS}/upgrades/${upgrade.icon}.png`);
    }

    this.load.audio(
      "click-sound",
      `${ASSETS}/sounds/click/click-pop-scatter.wav`,
    );
    this.load.audio(
      "buy-upgrade-sound",
      `${ASSETS}/sounds/upgrade/upgrade-gem-burst.wav`,
    );
    this.load.audio(
      "buy-building-sound",
      `${ASSETS}/sounds/building/building-hammer.wav`,
    );
    this.load.audio("entry-sound", `${ASSETS}/sounds/entry/entry-rift.wav`);
  }

  create() {
    this.cameras.main
      .setZoom(RENDER_SCALE)
      .centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    this.background = this.add.image(0, 0, "background").setOrigin(0);
    this.background.setScale(
      Math.max(
        GAME_WIDTH / this.background.width,
        GAME_HEIGHT / this.background.height,
      ),
    );

    this.add
      .text(GAME_WIDTH / 2, 440, "Little Hollow", textStyle(110, "#ffd66b"))
      .setOrigin(0.5);

    const hint = this.add
      .text(GAME_WIDTH / 2, 640, "Click to enter...", textStyle(40, "#ffd66b"))
      .setOrigin(0.5);
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    this.input.once("pointerdown", () => {
      this.sound.play("entry-sound");
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("GameScene"),
      );
    });
  }
}
