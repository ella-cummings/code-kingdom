import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import { BACKSTORY_LINES } from '../data/dialogData.js';

export default class CutsceneBackstory extends Phaser.Scene {
  constructor() {
    super({ key: 'CutsceneBackstory' });
  }

  preload() {
    // village_bg already cached from HomeScreen but safe to re-declare
    if (!this.textures.exists('village_bg')) {
      this.load.image('village_bg', 'assets/17.png');
    }
    this.load.image('player_idle', 'assets/1.png');
  }

  create() {
    // Background — same cover scale as HomeScreen
    this.add.image(400, 225, 'village_bg').setScale(0.732).setDepth(0);
    this.createClouds();
    this.add.rectangle(400, 225, 800, 450, 0x000000, 0.55).setDepth(2);

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Listen for dialog completion
    this.game.events.once('DIALOG_CLOSED', this.onDialogClosed, this);

    // Launch dialog
    gameState.dialogOpen = true;
    this.scene.launch('DialogSystem', {
      lines: BACKSTORY_LINES,
      triggerId: 'backstory',
    });
  }

  createClouds() {
    const defs = [
      { x: 180, y: 48, w: 110, h: 28, speed: 22000 },
      { x: 460, y: 32, w:  90, h: 22, speed: 31000 },
      { x: 700, y: 55, w: 130, h: 32, speed: 17000 },
      { x: -40, y: 40, w: 100, h: 24, speed: 26000 },
    ];
    defs.forEach((def) => {
      const cloud = this.add.graphics().setDepth(1);
      this.drawCloud(cloud, def.w, def.h);
      cloud.x = def.x;
      cloud.y = def.y;
      this.tweens.add({
        targets: cloud,
        x: def.x - 920,
        duration: def.speed,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => { cloud.x = 860; },
      });
    });
  }

  drawCloud(gfx, w, h) {
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    gfx.fillRoundedRect(-w / 2 + 12, -h / 2 - h * 0.45, w * 0.45, h * 0.65, h * 0.3);
  }

  onDialogClosed({ triggerId }) {
    if (triggerId !== 'backstory') return;
    gameState.dialogOpen = false;
    this.time.delayedCall(1000, () => {
      transitionTo(this, 'Level1_Village');
    });
  }

  shutdown() {
    this.game.events.off('DIALOG_CLOSED', this.onDialogClosed, this);
  }
}
