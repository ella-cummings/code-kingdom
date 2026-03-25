import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import { MENTOR_SENDOFF } from '../data/dialogData.js';

export default class EndScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScreen' });
  }

  preload() {
    if (!this.textures.exists('village_bg')) this.load.image('village_bg', 'assets/17.png');
  }

  create() {
    gameState.currentLevel = 'end';

    // ── Background ────────────────────────────────────────────────────────────
    this.add.image(400, 225, 'village_bg').setScale(0.732).setDepth(0);
    this.add.rectangle(400, 225, 800, 450, 0x000000, 0.6).setDepth(1);

    // ── Camera fade in ────────────────────────────────────────────────────────
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // ── Victory title ─────────────────────────────────────────────────────────
    const title = this.add.text(400, 80, 'YOU SAVED THE\nCODE KINGDOM!', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setDepth(2);

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ── Stats panel ───────────────────────────────────────────────────────────
    const lessonsLearned = [
      gameState.lesson1Viewed,
      gameState.lesson2Viewed,
      gameState.lesson3Viewed,
      gameState.lesson4Viewed,
    ].filter(Boolean).length;

    const questionsAnswered = [
      gameState.answeredQ1_L1, gameState.answeredQ2_L1, gameState.answeredQ3_L1,
      gameState.answeredQ1_L2, gameState.answeredQ2_L2, gameState.answeredQ3_L2,
      gameState.answeredQ1_L3, gameState.answeredQ2_L3, gameState.answeredQ3_L3,
      gameState.answeredQ1_L4, gameState.answeredQ2_L4,
    ].filter(Boolean).length + Math.min(gameState.fireballCharges, 2);

    this.add.rectangle(400, 240, 480, 140, 0x1a1a2e, 0.85)
      .setStrokeStyle(2, 0xffd700)
      .setDepth(2);

    const statStyle = {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
    };

    this.add.text(400, 190, `Lessons learned:  ${lessonsLearned} / 4`, statStyle)
      .setOrigin(0.5).setDepth(3);
    this.add.text(400, 220, `Questions answered:  ${questionsAnswered} / 13`, statStyle)
      .setOrigin(0.5).setDepth(3);
    this.add.text(400, 255, 'The Bug Dragon is defeated!', { ...statStyle, color: '#ff6666' })
      .setOrigin(0.5).setDepth(3);
    this.add.text(400, 285, 'The Code Kingdom is safe once more.', { ...statStyle, fontSize: '8px', color: '#aaffaa' })
      .setOrigin(0.5).setDepth(3);

    // ── Play Again button (hidden until after cards) ───────────────────────────
    this.btnBg = this.add.rectangle(400, 420, 260, 44, 0xffd700)
      .setDepth(2)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.btnText = this.add.text(400, 420, 'PLAY AGAIN', {
      fontFamily: '"Press Start 2P"',
      fontSize: '13px',
      color: '#1a1a2e',
    }).setOrigin(0.5).setDepth(3).setVisible(false);

    this.btnBg.on('pointerover', () => this.btnBg.setFillStyle(0xffe866));
    this.btnBg.on('pointerout',  () => this.btnBg.setFillStyle(0xffd700));
    this.btnBg.on('pointerdown', () => {
      this.resetGame();
      transitionTo(this, 'HomeScreen');
    });

    // ── Project cards panel (hidden until mentor dialog closes) ───────────────
    this.cardsPanel = this.createCardsPanel();
    this.cardsPanel.setVisible(false);

    // ── Listen for dialog close ───────────────────────────────────────────────
    this.game.events.on('DIALOG_CLOSED', this.onDialogClosed, this);

    // Launch mentor sendoff dialog after a short pause
    this.time.delayedCall(1000, () => {
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: MENTOR_SENDOFF, triggerId: 'mentor_sendoff' });
    });
  }

  // ── Project cards panel ───────────────────────────────────────────────────

  createCardsPanel() {
    const container = this.add.container(0, 0).setDepth(10);

    // Dark overlay behind cards
    container.add(
      this.add.rectangle(400, 225, 800, 450, 0x000000, 0.75),
    );

    // Panel title
    container.add(
      this.add.text(400, 18, 'YOUR NEXT CHALLENGE', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ffd700',
      }).setOrigin(0.5, 0),
    );

    const cards = [
      {
        emoji: '🎮',
        title: 'STORY QUIZ\nGAME',
        color: 0x1a4a2e,
        border: 0x44ff88,
        lines: [
          'Build a choose-your-own-',
          'adventure text game!',
          'Use if/else to create',
          '2+ different endings.',
          'YOU decide the story!',
        ],
      },
      {
        emoji: '🔢',
        title: 'NUMBER\nGUESSER',
        color: 0x1a1a4a,
        border: 0x4488ff,
        lines: [
          'Computer picks a secret',
          'number. Use a loop to',
          'keep guessing until right!',
          'Hints: Too high!',
          'Too low! Getting warmer!',
        ],
      },
      {
        emoji: '🎨',
        title: 'PATTERN\nDESIGNER',
        color: 0x3a1a3a,
        border: 0xdd44ff,
        lines: [
          'Use nested for loops to',
          'print * # or @ patterns.',
          'Try a triangle,',
          'checkerboard,',
          'or diamond!',
        ],
      },
    ];

    const cardW = 228;
    const cardH = 185;
    const startX = 28;
    const cardY = 42;
    const gap = 14;

    cards.forEach((card, i) => {
      const cx = startX + i * (cardW + gap);

      // Card background
      container.add(
        this.add.rectangle(cx, cardY, cardW, cardH, card.color)
          .setOrigin(0, 0)
          .setStrokeStyle(2, card.border),
      );

      // Header strip
      container.add(
        this.add.rectangle(cx, cardY, cardW, 38, card.border, 0.25).setOrigin(0, 0),
      );

      // Emoji + title
      container.add(
        this.add.text(cx + cardW / 2, cardY + 19, `${card.emoji} ${card.title}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: '7px',
          color: '#ffffff',
          align: 'center',
        }).setOrigin(0.5),
      );

      // Description lines
      card.lines.forEach((line, li) => {
        container.add(
          this.add.text(cx + 10, cardY + 46 + li * 22, line, {
            fontFamily: '"Press Start 2P"',
            fontSize: '6px',
            color: '#cccccc',
          }).setOrigin(0, 0),
        );
      });
    });

    // "LET'S GO!" button — reveals Play Again
    const letsBg = this.add.rectangle(400, 256, 220, 38, 0xffd700)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);
    const letsText = this.add.text(400, 256, "LET'S GO!", {
      fontFamily: '"Press Start 2P"',
      fontSize: '11px',
      color: '#1a1a2e',
    }).setOrigin(0.5);

    letsBg.on('pointerover', () => letsBg.setFillStyle(0xffe866));
    letsBg.on('pointerout',  () => letsBg.setFillStyle(0xffd700));
    letsBg.on('pointerdown', () => {
      container.setVisible(false);
      this.showPlayAgain();
    });

    this.tweens.add({
      targets: [letsBg, letsText],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    container.add([letsBg, letsText]);
    return container;
  }

  showPlayAgain() {
    this.btnBg.setVisible(true);
    this.btnText.setVisible(true);
    this.tweens.add({
      targets: [this.btnBg, this.btnText],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  onDialogClosed({ triggerId }) {
    if (triggerId === 'mentor_sendoff') {
      this.cardsPanel.setVisible(true);
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  resetGame() {
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
      currentLevel: 'home',
    });
  }

  shutdown() {
    this.game.events.off('DIALOG_CLOSED', this.onDialogClosed, this);
  }

  update() {}
}
