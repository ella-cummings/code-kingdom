import Phaser from 'phaser';
import gameState from '../gameState.js';
import { JavaSyntaxValidator } from './JavaSyntaxValidator.js';

const CX = 400; // container world x
const CY = 218; // container world y
const BOX_W = 700;
const BOX_H = 310;

export default class QuestionPopup extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestionPopup' });
  }

  init(data) {
    this.qData = data;
    this.triggerId = data.triggerId || '';
    this.strikeLimit = data.strikeLimit || null;
    this.strikes = 0;
    this.clickEnabled = false;
    this.domInput = null;
    this.answered = false;
  }

  create() {
    // Dim the gameplay scene
    this.add.rectangle(400, 225, 800, 450, 0x000000, 0.55).setDepth(19);

    // Main container — all popup children go here so shake moves them together
    this.container = this.add.container(CX, CY).setDepth(20);

    this.buildBox();

    if (this.qData.type === 'multiple_choice') {
      this.buildMultipleChoice();
    } else {
      this.buildTextInput();
    }

    // 100ms click guard
    this.time.delayedCall(100, () => {
      this.clickEnabled = true;
    });
  }

  buildBox() {
    const hw = BOX_W / 2;
    const hh = BOX_H / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x2a1a0e, 1);
    bg.fillRoundedRect(-hw, -hh, BOX_W, BOX_H, 8);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(-hw + 1, -hh + 1, BOX_W - 2, BOX_H - 2, 8);
    this.container.add(bg);

    // Question text
    this.questionText = this.add.text(0, -hh + 18, this.qData.question || '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#ffffff',
      wordWrap: { width: BOX_W - 60 },
      lineSpacing: 5,
      align: 'center',
    }).setOrigin(0.5, 0);
    this.container.add(this.questionText);

    // Feedback text (hidden initially)
    this.feedbackText = this.add.text(0, hh - 28, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#ff4444',
      wordWrap: { width: BOX_W - 60 },
      align: 'center',
    }).setOrigin(0.5, 1).setVisible(false);
    this.container.add(this.feedbackText);
  }

  buildMultipleChoice() {
    const options = this.qData.options || [];
    const startY = -20;
    const btnH = 44;
    const btnGap = 8;
    const btnW = 620;

    options.forEach((optText, i) => {
      const by = startY + i * (btnH + btnGap);

      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x1a0e05, 1);
      btnBg.fillRoundedRect(-btnW / 2, by, btnW, btnH, 4);
      btnBg.lineStyle(1, 0xffd700, 0.6);
      btnBg.strokeRoundedRect(-btnW / 2, by, btnW, btnH, 4);
      this.container.add(btnBg);

      const btnLabel = this.add.text(0, by + btnH / 2, optText, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
        wordWrap: { width: btnW - 20 },
        align: 'center',
      }).setOrigin(0.5);
      this.container.add(btnLabel);

      // Hit area — invisible rectangle mapped to world space
      const hitZone = this.add.zone(CX, CY + by + btnH / 2, btnW, btnH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a2a10, 1);
        btnBg.fillRoundedRect(-btnW / 2, by, btnW, btnH, 4);
        btnBg.lineStyle(2, 0xffd700, 1);
        btnBg.strokeRoundedRect(-btnW / 2, by, btnW, btnH, 4);
        btnLabel.setColor('#ffd700');
      });
      hitZone.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x1a0e05, 1);
        btnBg.fillRoundedRect(-btnW / 2, by, btnW, btnH, 4);
        btnBg.lineStyle(1, 0xffd700, 0.6);
        btnBg.strokeRoundedRect(-btnW / 2, by, btnW, btnH, 4);
        btnLabel.setColor('#ffffff');
      });
      hitZone.on('pointerdown', () => {
        if (!this.clickEnabled || this.answered) return;
        this.checkMultipleChoice(optText);
      });
    });
  }

  buildTextInput() {
    // HTML input element
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.placeholder = 'Type your Java code here...';
    inputEl.style.cssText = [
      'background: #0a0a1a',
      'border: 2px solid #ffd700',
      'color: #00ff88',
      'font-family: "Courier New", monospace',
      'font-size: 11px',
      'padding: 8px 12px',
      'width: 560px',
      'outline: none',
      'border-radius: 4px',
    ].join(';');

    this.domInput = this.add.dom(CX, CY + 55, inputEl).setDepth(25);

    // Submit button
    const submitBtn = this.add.text(0, 100, '[ CHECK ANSWER ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#000000',
      backgroundColor: '#ffd700',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.container.add(submitBtn);

    submitBtn.on('pointerover', () => submitBtn.setColor('#333333'));
    submitBtn.on('pointerout', () => submitBtn.setColor('#000000'));
    submitBtn.on('pointerdown', () => {
      if (!this.clickEnabled || this.answered) return;
      const raw = inputEl.value.trim();
      if (!raw) return;
      this.checkTextInput(raw);
    });

    // stopPropagation prevents Phaser's window-level keyboard listener from calling
    // preventDefault() on each keydown, which would block characters from reaching the input.
    inputEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        if (!this.clickEnabled || this.answered) return;
        const raw = inputEl.value.trim();
        if (!raw) return;
        this.checkTextInput(raw);
      }
    });
  }

  checkMultipleChoice(chosen) {
    const correct = this.qData.correctAnswer;
    if (chosen === correct) {
      this.onCorrect();
    } else {
      this.onWrong();
    }
  }

  checkTextInput(raw) {
    const result = JavaSyntaxValidator.validate(this.qData.validator, raw);
    if (result.valid) {
      this.onCorrect();
    } else {
      this.onWrong();
    }
  }

  onCorrect() {
    this.answered = true;
    this.feedbackText.setText(this.qData.correctFeedback || 'Correct!').setColor('#00ff88').setVisible(true);
    this.time.delayedCall(1200, () => this.closeQuestion(false));
  }

  onWrong() {
    this.strikes++;

    if (this.strikeLimit && this.strikes >= this.strikeLimit) {
      this.showRevealPanel();
      return;
    }

    this.shakeBox();
    const feedback = this.qData.wrongFeedback || 'Not quite. Try again!';
    this.feedbackText.setText(feedback).setColor('#ff4444').setVisible(true);
  }

  shakeBox() {
    this.tweens.add({
      targets: this.container,
      x: { from: CX - 8, to: CX + 8 },
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.container.x = CX;
      },
    });
  }

  showRevealPanel() {
    // Clear existing container children
    this.container.removeAll(true);
    if (this.domInput) {
      this.domInput.destroy();
      this.domInput = null;
    }

    const hw = BOX_W / 2;
    const hh = BOX_H / 2;

    // Blue reveal background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1a3a, 1);
    bg.fillRoundedRect(-hw, -hh, BOX_W, BOX_H, 8);
    bg.lineStyle(2, 0x4488ff, 1);
    bg.strokeRoundedRect(-hw + 1, -hh + 1, BOX_W - 2, BOX_H - 2, 8);
    this.container.add(bg);

    this.container.add(
      this.add.text(0, -hh + 14, "Let me show you how it's done!", {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#88bbff',
        align: 'center',
      }).setOrigin(0.5, 0)
    );

    // Code block background
    const codeText = this.qData.revealCode || '';
    const codeBg = this.add.graphics();
    codeBg.fillStyle(0x050510, 1);
    codeBg.fillRect(-hw + 20, -hh + 55, BOX_W - 40, 90);
    this.container.add(codeBg);

    this.container.add(
      this.add.text(-hw + 30, -hh + 63, codeText, {
        fontFamily: 'Courier New, monospace',
        fontSize: '9px',
        color: '#00ff88',
        wordWrap: { width: BOX_W - 80 },
        lineSpacing: 4,
      }).setOrigin(0, 0)
    );

    this.container.add(
      this.add.text(0, -hh + 162, this.qData.revealExplanation || '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        color: '#ffffff',
        wordWrap: { width: BOX_W - 60 },
        lineSpacing: 4,
        align: 'center',
      }).setOrigin(0.5, 0)
    );

    // GOT IT button
    const gotIt = this.add.text(0, hh - 30, '[ GOT IT ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#000000',
      backgroundColor: '#4488ff',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.container.add(gotIt);

    gotIt.on('pointerdown', () => {
      this.closeQuestion(true);
    });
  }

  closeQuestion(wasRevealed) {
    if (this.domInput) {
      this.domInput.destroy();
      this.domInput = null;
    }
    gameState.questionOpen = false;
    this.game.events.emit('QUESTION_CLOSED', {
      triggerId: this.triggerId,
      correct: true,
      revealed: wasRevealed,
    });
    this.scene.stop();
  }

  shutdown() {
    if (this.domInput) {
      this.domInput.destroy();
      this.domInput = null;
    }
  }
}
