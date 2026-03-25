import Phaser from 'phaser';
import { transitionTo } from '../utils/sceneHelpers.js';
import { chiptunePlayer } from '../systems/ChiptunePlayer.js';
import gameState from '../gameState.js';

// village_bg (17.png) is 1511×615 after crop.
// Cover-mode: max(800/1511, 450/615) = 450/615 = 0.732 → displayed 1106×450.
// Center vertically to fill the 450px canvas.
const BG_SCALE  = 0.732;
const BG_Y      = 225;

export default class HomeScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScreen' });
  }

  preload() {
    this.load.image('village_bg', 'assets/17.png');
  }

  create() {
    // Background — fill width, correct y so ground aligns
    this.add.image(400, BG_Y, 'village_bg').setScale(BG_SCALE).setDepth(0);

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

    // Dev jump menu (right side panel)
    this.createDevMenu();

    // Click to start — only fires for clicks outside the dev panel (x < 620)
    this.input.on('pointerdown', (ptr) => {
      if (ptr.x >= 620) return;
      chiptunePlayer.start();
      transitionTo(this, 'CutsceneBackstory');
    });
  }

  createDevMenu() {
    const PX = 625; // left edge of panel
    const PW = 168;
    const PH = 220;
    const PY = 210;

    // Panel background
    this.add.rectangle(PX + PW / 2, PY + PH / 2, PW, PH, 0x000000, 0.75)
      .setDepth(9)
      .setStrokeStyle(1, 0xffd700);

    // Label
    this.add.text(PX + PW / 2, PY + 10, 'DEV MENU', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#ffd700',
    }).setOrigin(0.5, 0).setDepth(10);

    const levels = [
      { label: 'Level 1',   scene: 'Level1_Village',  setup: () => this.setupForLevel(1) },
      { label: 'Level 2',   scene: 'Level2_Cauldron',  setup: () => this.setupForLevel(2) },
      { label: 'Level 3',   scene: 'Level3_Forest',    setup: () => this.setupForLevel(3) },
      { label: 'Level 4',   scene: 'Level4_Mountain',  setup: () => this.setupForLevel(4) },
      { label: 'Level 5',   scene: 'Level5_Castle',    setup: () => this.setupForLevel(5) },
    ];

    levels.forEach((lvl, i) => {
      const btnY = PY + 40 + i * 36;
      const btn = this.add.rectangle(PX + PW / 2, btnY, 148, 28, 0x1a1a2e)
        .setDepth(10)
        .setStrokeStyle(1, 0x666666)
        .setInteractive({ useHandCursor: true });

      const lbl = this.add.text(PX + PW / 2, btnY, lvl.label, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#cccccc',
      }).setOrigin(0.5).setDepth(11);

      btn.on('pointerover', () => { btn.setStrokeStyle(1, 0xffd700); lbl.setColor('#ffd700'); });
      btn.on('pointerout',  () => { btn.setStrokeStyle(1, 0x666666); lbl.setColor('#cccccc'); });
      btn.on('pointerdown', () => {
        lvl.setup();
        chiptunePlayer.start();
        transitionTo(this, lvl.scene);
      });
    });
  }

  setupForLevel(level) {
    // Reset first, then set all flags for levels completed before the target
    Object.assign(gameState, {
      talkedToVillager1: false, talkedToVillager2: false,
      talkedToVillager3: false, talkedToVillager4: false,
      lesson1Viewed: false, lesson2Viewed: false,
      lesson3Viewed: false, lesson4Viewed: false,
      answeredQ1_L1: false, answeredQ2_L1: false, answeredQ3_L1: false,
      answeredQ1_L2: false, answeredQ2_L2: false, answeredQ3_L2: false,
      answeredQ1_L3: false, answeredQ2_L3: false, answeredQ3_L3: false,
      answeredQ1_L4: false, answeredQ2_L4: false, answeredQ3_L4: false,
      mountainQ2Attempts: 0, mountainQ2Revealed: false,
      bridgeBuilt: false, fireballCharges: 0, dragonDefeated: false,
      dialogOpen: false, questionOpen: false, lessonOpen: false,
    });

    if (level >= 2) {
      Object.assign(gameState, {
        talkedToVillager1: true, talkedToVillager2: true,
        talkedToVillager3: true, talkedToVillager4: true,
        lesson1Viewed: true,
        answeredQ1_L1: true, answeredQ2_L1: true, answeredQ3_L1: true,
      });
    }
    if (level >= 3) {
      Object.assign(gameState, {
        lesson2Viewed: true,
        answeredQ1_L2: true, answeredQ2_L2: true, answeredQ3_L2: true,
      });
    }
    if (level >= 4) {
      Object.assign(gameState, {
        lesson3Viewed: true,
        answeredQ1_L3: true, answeredQ2_L3: true, answeredQ3_L3: true,
      });
    }
    if (level >= 5) {
      Object.assign(gameState, {
        lesson4Viewed: true,
        answeredQ1_L4: true, answeredQ2_L4: true, answeredQ3_L4: true,
        bridgeBuilt: true,
      });
    }
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
