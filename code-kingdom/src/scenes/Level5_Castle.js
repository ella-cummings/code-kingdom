import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import { DRAGON_INTRO, DRAGON_DEFEATED } from '../data/dialogData.js';

const MAX_CHARGES = 10;

export default class Level5_Castle extends Phaser.Scene {
  constructor() {
    super({ key: 'Level5_Castle' });
  }

  preload() {
    if (!this.textures.exists('dragon_bg'))   this.load.image('dragon_bg',   'assets/21.png');
    if (!this.textures.exists('dragon'))      this.load.image('dragon',      'assets/14.png');
    if (!this.textures.exists('explosion'))   this.load.image('explosion',   'assets/15.png');
    if (!this.textures.exists('fireball'))    this.load.image('fireball',    'assets/13.png');
    if (!this.textures.exists('player_idle')) this.load.image('player_idle', 'assets/1.png');
  }

  create() {
    gameState.currentLevel = 'level5';

    // ── Background ────────────────────────────────────────────────────────────
    this.add.image(400, 225, 'dragon_bg')
      .setScale(Math.max(800 / 1476, 450 / 881))
      .setDepth(0);

    // ── Clouds ────────────────────────────────────────────────────────────────
    this.createClouds();

    // ── Player ────────────────────────────────────────────────────────────────
    this.add.image(150, 410, 'player_idle')
      .setScale(0.062)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // ── Dragon ────────────────────────────────────────────────────────────────
    this.dragon = this.add.image(600, 280, 'dragon')
      .setScale(0.14)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // Dragon idle float
    this.dragonTween = this.tweens.add({
      targets: this.dragon,
      y: 265,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Fireball sprite (starts hidden at player side) ─────────────────────────
    this.fireball = this.add.image(150, 360, 'fireball')
      .setScale(0.05)
      .setDepth(4)
      .setVisible(false);

    // ── Boss UI (hidden until intro dialog closes) ─────────────────────────────
    this.bossUI = this.add.container(0, 0).setDepth(8).setVisible(false);
    this.createBossUI();

    // ── Level title ───────────────────────────────────────────────────────────
    this.showLevelTitle("Level 5: The Dragon's Lair");

    // ── Camera ────────────────────────────────────────────────────────────────
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── State ─────────────────────────────────────────────────────────────────
    this.charges = 0;
    this.battleActive = false;

    this.game.events.on('DIALOG_CLOSED', this.onDialogClosed, this);

    // Dragon intro dialog after short pause
    this.time.delayedCall(1200, () => {
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: DRAGON_INTRO, triggerId: 'dragon_intro' });
    });
  }

  // ── Boss UI ────────────────────────────────────────────────────────────────

  createBossUI() {
    // "FIREBALL POWER" label — centered at x=400
    this.bossUI.add(
      this.add.text(400, 20, 'FIREBALL POWER', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#ffd700',
      }).setOrigin(0.5, 0),
    );

    // Grey bar background — centered at x=400, spans x=200–600
    this.bossUI.add(
      this.add.rectangle(400, 46, 400, 24, 0x333333).setOrigin(0.5, 0),
    );

    // Red charge bar fill — overlays grey, grows 10% per charge via scaleX
    this.chargeBar = this.add.rectangle(200, 46, 400, 24, 0xff0000).setOrigin(0, 0).setScale(0, 1);
    this.bossUI.add(this.chargeBar);

    // Counter text "0 / 10" — right of bar
    this.chargeText = this.add.text(620, 49, `0 / ${MAX_CHARGES}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.bossUI.add(this.chargeText);

    // CHARGE button
    this.chargeBtn = this.add.rectangle(400, 390, 220, 50, 0xcc0000)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
    this.bossUI.add(this.chargeBtn);

    this.chargeBtnText = this.add.text(400, 390, '⚡ CHARGE! ⚡', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.bossUI.add(this.chargeBtnText);

    // Pulse tween on button
    this.tweens.add({
      targets: [this.chargeBtn, this.chargeBtnText],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.chargeBtn.on('pointerdown', () => this.onCharge());
    this.chargeBtn.on('pointerover', () => this.chargeBtn.setFillStyle(0xff2200));
    this.chargeBtn.on('pointerout',  () => this.chargeBtn.setFillStyle(0xcc0000));
  }

  // ── Charge mechanic ────────────────────────────────────────────────────────

  onCharge() {
    if (!this.battleActive) return;
    this.charges++;
    gameState.fireballCharges = this.charges;

    // Red bar grows 10% per charge via scaleX (0 → 1 over 10 charges)
    this.chargeBar.scaleX = this.charges * 0.1;

    // Scale fireball with charges
    const t = this.charges / MAX_CHARGES;
    const fbScale = 0.05 + (t * 0.06);
    this.fireball.setScale(fbScale).setVisible(true);

    this.chargeText.setText(`${this.charges} / ${MAX_CHARGES}`);

    if (this.charges >= MAX_CHARGES) {
      this.fireFinalShot();
    }
  }

  fireFinalShot() {
    this.battleActive = false;

    // Hide charge button
    this.chargeBtn.disableInteractive();
    this.chargeBtn.setVisible(false);
    this.chargeBtnText.setVisible(false);

    // "FIRE!!" text
    const fireText = this.add.text(400, 300, 'FIRE!!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#ff4400',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(10);

    this.time.delayedCall(500, () => {
      fireText.destroy();
      this.fireball.setVisible(true).setScale(0.09);

      // Tween fireball from player to dragon
      this.tweens.add({
        targets: this.fireball,
        x: this.dragon.x,
        y: this.dragon.y - 40,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          this.fireball.setVisible(false);
          this.dragonHit();
        },
      });
    });
  }

  dragonHit() {
    gameState.dragonDefeated = true;
    this.dragonTween.stop();

    // Swap dragon sprite to explosion
    this.dragon.setTexture('explosion');

    // Scale explosion: 0.5 → 2.0 → 1.5 → fade
    this.tweens.chain({
      targets: this.dragon,
      tweens: [
        { scaleX: 0.25, scaleY: 0.25, duration: 0 },
        { scaleX: 1.0,  scaleY: 1.0,  duration: 400, ease: 'Power2' },
        { scaleX: 0.75, scaleY: 0.75, duration: 300, ease: 'Sine.easeOut' },
        { alpha: 0,                    duration: 500 },
      ],
    });

    // Screen flash
    const flash = this.add.rectangle(400, 225, 800, 450, 0xffffff, 0).setDepth(20);
    this.tweens.chain({
      targets: flash,
      tweens: [
        { alpha: 1, duration: 100 },
        { alpha: 1, duration: 200 },
        { alpha: 0, duration: 300 },
      ],
    });

    // Camera shake
    this.cameras.main.shake(500, 0.015);

    // Victory dialog after 1500ms
    this.time.delayedCall(1500, () => {
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: DRAGON_DEFEATED, triggerId: 'dragon_defeated' });
    });
  }

  // ── Dialog handler ────────────────────────────────────────────────────────

  onDialogClosed({ triggerId }) {
    if (triggerId === 'dragon_intro') {
      // Show boss UI and activate battle
      this.bossUI.setVisible(true);
      this.fireball.setVisible(true).setAlpha(0.6);
      this.battleActive = true;
    } else if (triggerId === 'dragon_defeated') {
      this.time.delayedCall(500, () => transitionTo(this, 'EndScreen'));
    }
  }

  // ── Level title ───────────────────────────────────────────────────────────

  showLevelTitle(title) {
    const text = this.add.text(400, 225, title, {
      fontFamily: '"Press Start 2P"',
      fontSize: '18px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    })
      .setOrigin(0.5)
      .setDepth(10);

    const pulse = this.tweens.add({
      targets: text,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.time.delayedCall(3500, () => {
      pulse.stop();
      this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 600,
        ease: 'Linear',
        onComplete: () => text.destroy(),
      });
    });
  }

  // ── Clouds ────────────────────────────────────────────────────────────────

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

  update() {}

  shutdown() {
    this.game.events.off('DIALOG_CLOSED', this.onDialogClosed, this);
  }
}
