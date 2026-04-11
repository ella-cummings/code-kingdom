import Phaser from 'phaser';
import { transitionTo } from '../utils/sceneHelpers.js';
import { chiptunePlayer } from '../systems/ChiptunePlayer.js';

// village_bg (17.png) is 1121×242; scale 1.86 fills 450px height and tiles horizontally.
const BG_SCALE  = 1.86;

export default class HomeScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScreen' });
  }

  preload() {
    this.load.image('village_bg', 'assets/17.png');
  }

  create() {
    // Background — tiled horizontally, scaled to fill 450px height
    this.add.tileSprite(0, 0, 800, 450, 'village_bg')
      .setOrigin(0, 0)
      .setTileScale(BG_SCALE, BG_SCALE)
      .setDepth(0);

    // Drifting cloud shapes in the sky region
    this.createClouds();

    // Title drop shadow
    this.add.text(403, 103, 'CODE KINGDOM', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#000000',
    }).setOrigin(0.5).setDepth(2);

    this.add.text(400, 100, 'CODE KINGDOM', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#ffd700',
    }).setOrigin(0.5).setDepth(3);

    // Subtitle
    this.add.text(400, 140, 'A Java Adventure', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(3);

    // Pulsing start prompt
    const startText = this.add.text(400, 390, 'CLICK ANYWHERE TO START', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(3);

    this.tweens.add({
      targets: startText,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Camera fade-in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Launch persistent volume slider (once for the whole game)
    if (!this.scene.isActive('VolumeSlider')) {
      this.scene.launch('VolumeSlider');
    }

    // Click anywhere to start (ignore clicks in slider zone)
    this.input.on('pointerdown', (ptr) => {
      if (ptr.y < 48 && ptr.x > 668) return;
      chiptunePlayer.start();
      transitionTo(this, 'CutsceneBackstory');
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
}
