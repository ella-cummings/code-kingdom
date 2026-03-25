import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import {
  OWL_INTRO,
  OWL_Q1_TO_Q2,
  OWL_Q2_TO_Q3,
  OWL_FINAL,
} from '../data/dialogData.js';
import { FOREST_Q1, FOREST_Q2, FOREST_Q3 } from '../data/questionData.js';

const LEVEL_WIDTH  = 2500;
const GROUND_Y     = 400;
const PLAYER_SPEED = 180;
const JUMP_VEL     = -370;
const WALK_MS      = 200;
const TALK_RANGE   = 100;

export default class Level3_Forest extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3_Forest' });
  }

  preload() {
    if (!this.textures.exists('forest_bg'))   this.load.image('forest_bg',   'assets/18.png');
    if (!this.textures.exists('player_idle')) this.load.image('player_idle', 'assets/1.png');
    if (!this.textures.exists('player_walk')) this.load.image('player_walk', 'assets/2.png');
    if (!this.textures.exists('owl'))         this.load.image('owl',         'assets/10.png');
    if (!this.textures.exists('sign'))        this.load.image('sign',        'assets/11.png');
    if (!this.textures.exists('rock'))        this.load.image('rock',        'assets/6.png');
    if (!this.textures.exists('log'))         this.load.image('log',         'assets/4.png');
  }

  create() {
    gameState.currentLevel = 'level3';

    // ── Background (tiled for scrolling) ──────────────────────────────────────
    const bgScale = Math.max(800 / 1470, 450 / 712);
    this.bgTile = this.add
      .tileSprite(0, 0, LEVEL_WIDTH, 450, 'forest_bg')
      .setOrigin(0, 0)
      .setDepth(0)
      .setTileScale(bgScale, bgScale);

    // ── Physics world ─────────────────────────────────────────────────────────
    this.physics.world.gravity.y = 900;
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 450);

    const ground = this.physics.add.staticGroup();
    ground
      .create(LEVEL_WIDTH / 2, GROUND_Y + 10, null)
      .setDisplaySize(LEVEL_WIDTH, 20)
      .refreshBody()
      .setVisible(false);

    // ── Player ────────────────────────────────────────────────────────────────
    this.player = this.physics.add
      .sprite(120, GROUND_Y - 4, 'player_idle')
      .setScale(0.062)
      .setOrigin(0.5, 1)
      .setDepth(4)
      .setCollideWorldBounds(true);

    this.physics.add.collider(this.player, ground);
    this.walkFrame = 0;
    this.walkTimer = 0;

    // ── Camera ────────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 450);
    this.cameras.main.startFollow(this.player, true, 0.1, 0);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── Input ─────────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
      e:     Phaser.Input.Keyboard.KeyCodes.E,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // ── Clouds (scroll-fixed) ─────────────────────────────────────────────────
    this.createClouds();

    // ── Owl (x=250, feet on ground) ───────────────────────────────────────────
    this.add.image(250, GROUND_Y, 'owl')
      .setScale(0.08)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // ── Landmarks ────────────────────────────────────────────────────────────
    this.rock = this.add.image(1100, GROUND_Y, 'rock')
      .setScale(0.09)
      .setOrigin(0.5, 1)
      .setDepth(3);

    this.log = this.add.image(1700, GROUND_Y, 'log')
      .setScale(0.09)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // ── Signs ─────────────────────────────────────────────────────────────────
    this.signs = [
      this.createSign(600,  'HEAD TO THE BIG ROCK'),
      this.createSign(1150, 'HEAD TO THE FALLEN LOG'),
      this.createSign(1750, 'PRESS ONWARD TO\nLOOP MOUNTAIN'),
    ];

    // ── Level title ───────────────────────────────────────────────────────────
    this.showLevelTitle('Level 3: The Forest');

    // ── Interaction state ─────────────────────────────────────────────────────
    this.interactionStep = null;
    // signIndex: which sign can currently be interacted with (none until after lesson)
    this.unlockedSign = -1;

    this.game.events.on('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.on('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.on('QUESTION_CLOSED', this.onQuestionClosed, this);

    // Auto-launch owl intro after short pause
    this.time.delayedCall(1000, () => {
      this.interactionStep = 'owl_intro';
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: OWL_INTRO, triggerId: 'owl_intro' });
    });
  }

  // ── Sign factory ──────────────────────────────────────────────────────────

  createSign(x, revealText) {
    const img = this.add.image(x, GROUND_Y, 'sign')
      .setScale(0.08)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // '?' shown before answer
    const questionMark = this.add.text(x, GROUND_Y - img.displayHeight - 4, '?', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(5);

    // Revealed direction text
    const revealed = this.add.text(x, GROUND_Y - img.displayHeight - 4, revealText, {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(5).setVisible(false);

    // [E] READ label
    const label = this.add.text(x, GROUND_Y - img.displayHeight - 30, '[ E ] READ', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(5).setVisible(false);

    return { img, questionMark, revealed, label, x, done: false };
  }

  // ── Landmark sparkle ──────────────────────────────────────────────────────

  sparkle(target) {
    for (let i = 0; i < 8; i++) {
      const spark = this.add.rectangle(
        target.x + Phaser.Math.Between(-20, 20),
        target.y - Phaser.Math.Between(10, 50),
        5, 5, 0xffd700,
      ).setDepth(5);

      this.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(20, 50),
        alpha: 0,
        duration: Phaser.Math.Between(500, 900),
        onComplete: () => spark.destroy(),
      });
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  onDialogClosed({ triggerId }) {
    switch (triggerId) {
      case 'owl_intro':
        this.interactionStep = 'lesson3';
        gameState.lessonOpen = true;
        this.scene.launch('LessonScreen', { lessonId: 'lesson3', triggerId: 'lesson3' });
        break;

      case 'owl_q1_to_q2':
        this.interactionStep = null;
        this.unlockedSign = 1;
        break;

      case 'owl_q2_to_q3':
        this.interactionStep = null;
        this.unlockedSign = 2;
        break;

      case 'owl_final':
        this.time.delayedCall(500, () => transitionTo(this, 'Level4_Mountain'));
        break;
    }
  }

  onLessonClosed({ triggerId }) {
    if (triggerId !== 'lesson3') return;
    gameState.lesson3Viewed = true;
    this.interactionStep = null;
    this.unlockedSign = 0; // unlock sign1
  }

  onQuestionClosed({ correct }) {
    if (!correct) return;

    if (this.interactionStep === 'sign_q1') {
      gameState.answeredQ1_L3 = true;
      this.signs[0].done = true;
      this.signs[0].questionMark.setVisible(false);
      this.signs[0].revealed.setVisible(true);
      this.sparkle(this.rock);
      this.time.delayedCall(900, () => {
        this.interactionStep = 'owl_q1_to_q2';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: OWL_Q1_TO_Q2, triggerId: 'owl_q1_to_q2' });
      });

    } else if (this.interactionStep === 'sign_q2') {
      gameState.answeredQ2_L3 = true;
      this.signs[1].done = true;
      this.signs[1].questionMark.setVisible(false);
      this.signs[1].revealed.setVisible(true);
      this.sparkle(this.log);
      this.time.delayedCall(900, () => {
        this.interactionStep = 'owl_q2_to_q3';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: OWL_Q2_TO_Q3, triggerId: 'owl_q2_to_q3' });
      });

    } else if (this.interactionStep === 'sign_q3') {
      gameState.answeredQ3_L3 = true;
      this.signs[2].done = true;
      this.signs[2].questionMark.setVisible(false);
      this.signs[2].revealed.setVisible(true);
      this.time.delayedCall(900, () => {
        this.interactionStep = 'owl_final';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: OWL_FINAL, triggerId: 'owl_final' });
      });
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(_time, delta) {
    if (gameState.dialogOpen || gameState.questionOpen || gameState.lessonOpen) {
      this.player.setVelocityX(0);
      this.player.setTexture('player_idle');
      this.walkTimer = 0;
      return;
    }

    const left  = this.cursors.left.isDown  || this.cursors.a.isDown;
    const right = this.cursors.right.isDown || this.cursors.d.isDown;
    const jump  = Phaser.Input.Keyboard.JustDown(this.cursors.up)    ||
                  Phaser.Input.Keyboard.JustDown(this.cursors.w)     ||
                  Phaser.Input.Keyboard.JustDown(this.cursors.space);
    const talk  = Phaser.Input.Keyboard.JustDown(this.cursors.e);

    if (left)       { this.player.setVelocityX(-PLAYER_SPEED); this.player.setFlipX(true); }
    else if (right) { this.player.setVelocityX(PLAYER_SPEED);  this.player.setFlipX(false); }
    else            { this.player.setVelocityX(0); }

    if (jump && this.player.body.blocked.down) this.player.setVelocityY(JUMP_VEL);

    const moving = left || right;
    if (moving) {
      this.walkTimer += delta;
      if (this.walkTimer >= WALK_MS) {
        this.walkTimer = 0;
        this.walkFrame = 1 - this.walkFrame;
        this.player.setTexture(this.walkFrame === 0 ? 'player_idle' : 'player_walk');
      }
    } else {
      this.player.setTexture('player_idle');
      this.walkTimer = 0;
      this.walkFrame = 0;
    }

    // ── Sign proximity & E key ────────────────────────────────────────────────
    const px = this.player.x;
    let nearSign = null;

    this.signs.forEach((sign, i) => {
      const unlocked = !sign.done && this.unlockedSign >= i && this.interactionStep === null;
      const inRange  = unlocked && Math.abs(px - sign.x) < TALK_RANGE;
      sign.label.setVisible(inRange);
      if (inRange) nearSign = { sign, index: i };
    });

    if (talk && nearSign) {
      this.interactionSign(nearSign.sign, nearSign.index);
    }
  }

  interactionSign(sign, index) {
    sign.label.setVisible(false);
    const steps = ['sign_q1', 'sign_q2', 'sign_q3'];
    const questions = [FOREST_Q1, FOREST_Q2, FOREST_Q3];
    this.interactionStep = steps[index];
    gameState.questionOpen = true;
    this.scene.launch('QuestionPopup', questions[index]);
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
      .setScrollFactor(0)
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
      const cloud = this.add.graphics().setDepth(1).setScrollFactor(0);
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

  shutdown() {
    this.game.events.off('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.off('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.off('QUESTION_CLOSED', this.onQuestionClosed, this);
  }
}
