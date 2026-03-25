import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import {
  WITCH_POST_LESSON,
  WITCH_Q1_TO_Q2,
  WITCH_Q2_TO_Q3,
  WITCH_FINAL,
} from '../data/dialogData.js';
import { CAULDRON_Q1, CAULDRON_Q2, CAULDRON_Q3 } from '../data/questionData.js';

// Level 2 stays in the village — reuse village_bg (17.png, scale 0.732)
const BG_SCALE  = 0.732;
const GROUND_Y  = 430;

const SCALE = {
  player:   0.062,
  villager4: 0.050,
  cauldron:  0.058,
};

// Cauldron tint progression per ingredient
const TINTS = [0x66ff88, 0xcc44ff, 0xffd700];

export default class Level2_Cauldron extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2_Cauldron' });
  }

  preload() {
    if (!this.textures.exists('village_bg')) this.load.image('village_bg', 'assets/17.png');
    if (!this.textures.exists('player_idle')) this.load.image('player_idle', 'assets/1.png');
    if (!this.textures.exists('villager4'))   this.load.image('villager4',   'assets/8.png');
    if (!this.textures.exists('cauldron'))    this.load.image('cauldron',    'assets/9.png');
  }

  create() {
    gameState.currentLevel = 'level2';

    // ── Background ────────────────────────────────────────────────────────────
    this.add.image(400, 225, 'village_bg').setScale(BG_SCALE).setDepth(0);

    // ── Clouds ────────────────────────────────────────────────────────────────
    this.createClouds();

    // ── Scene sprites ─────────────────────────────────────────────────────────
    // Player arrives from left
    this.add.image(160, GROUND_Y, 'player_idle')
      .setScale(SCALE.player)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // Witch stands left of cauldron
    this.add.image(380, GROUND_Y, 'villager4')
      .setScale(SCALE.villager4)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // Cauldron — stored so we can tint it during questions
    this.cauldron = this.add.image(530, GROUND_Y, 'cauldron')
      .setScale(SCALE.cauldron)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // ── Level title ───────────────────────────────────────────────────────────
    this.showLevelTitle('Level 2: The Cauldron');

    // ── Camera fade in ────────────────────────────────────────────────────────
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── Global event listeners ────────────────────────────────────────────────
    this.interactionStep = null;
    this.ingredientCount = 0;

    this.game.events.on('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.on('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.on('QUESTION_CLOSED', this.onQuestionClosed, this);

    // Auto-open Lesson 2 after a short pause
    this.time.delayedCall(1200, () => {
      this.interactionStep = 'lesson2';
      gameState.lessonOpen = true;
      this.scene.launch('LessonScreen', { lessonId: 'lesson2', triggerId: 'lesson2' });
    });
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  onLessonClosed({ triggerId }) {
    if (triggerId !== 'lesson2') return;
    gameState.lesson2Viewed = true;
    this.interactionStep = 'witch_post_lesson';
    gameState.dialogOpen = true;
    this.scene.launch('DialogSystem', { lines: WITCH_POST_LESSON, triggerId: 'witch_post_lesson' });
  }

  onDialogClosed({ triggerId }) {
    switch (triggerId) {
      case 'witch_post_lesson':
        this.interactionStep = 'cauldron_q1';
        gameState.questionOpen = true;
        this.scene.launch('QuestionPopup', CAULDRON_Q1);
        break;

      case 'witch_q1_to_q2':
        this.interactionStep = 'cauldron_q2';
        gameState.questionOpen = true;
        this.scene.launch('QuestionPopup', CAULDRON_Q2);
        break;

      case 'witch_q2_to_q3':
        this.interactionStep = 'cauldron_q3';
        gameState.questionOpen = true;
        this.scene.launch('QuestionPopup', CAULDRON_Q3);
        break;

      case 'witch_final':
        this.time.delayedCall(500, () => transitionTo(this, 'Level3_Forest'));
        break;
    }
  }

  onQuestionClosed({ correct }) {
    if (!correct) return;

    // Animate cauldron tint for each ingredient added
    this.addIngredient();

    this.time.delayedCall(900, () => {
      if (this.interactionStep === 'cauldron_q1') {
        this.interactionStep = 'witch_q1_to_q2';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: WITCH_Q1_TO_Q2, triggerId: 'witch_q1_to_q2' });

      } else if (this.interactionStep === 'cauldron_q2') {
        this.interactionStep = 'witch_q2_to_q3';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: WITCH_Q2_TO_Q3, triggerId: 'witch_q2_to_q3' });

      } else if (this.interactionStep === 'cauldron_q3') {
        this.interactionStep = 'witch_final';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: WITCH_FINAL, triggerId: 'witch_final' });
      }
    });
  }

  // ── Cauldron ingredient animation ─────────────────────────────────────────

  addIngredient() {
    const tint = TINTS[this.ingredientCount] ?? 0xffffff;
    this.ingredientCount++;

    // Bubble up then settle
    this.tweens.add({
      targets: this.cauldron,
      scaleY: SCALE.cauldron * 1.25,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.cauldron.setTint(tint);
      },
    });
  }

  // ── Level title banner (same as Level 1) ─────────────────────────────────

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

  // ── Clouds (same as Level 1) ──────────────────────────────────────────────

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
    this.game.events.off('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.off('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.off('QUESTION_CLOSED', this.onQuestionClosed, this);
  }
}
