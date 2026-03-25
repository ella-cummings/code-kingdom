import Phaser from 'phaser';
import gameState from '../gameState.js';
import { LESSONS } from '../data/lessonContent.js';

const HEADER_H = 50;
const VISIBLE_H = 358; // scrollable viewport height
const SCROLL_TOP = HEADER_H; // y position where scroll area starts on screen
const FOOTER_Y = SCROLL_TOP + VISIBLE_H; // 408
const PAD_X = 35;
const CONTENT_W = 800 - PAD_X * 2; // 730

export default class LessonScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'LessonScreen' });
  }

  init(data) {
    this.lessonId = data.lessonId || 'lesson1';
    this.triggerId = data.triggerId || '';
    this.continueUnlocked = false;
    this.clickEnabled = false;
    this.totalContentH = 0;
  }

  create() {
    const lesson = LESSONS[this.lessonId];
    if (!lesson) return;

    // Opaque overlay
    this.add.rectangle(400, 225, 800, 450, 0x0d0d1a).setDepth(28);

    // Gold header bar
    this.add.rectangle(400, HEADER_H / 2, 800, HEADER_H, 0xffd700).setDepth(29);
    this.add.text(400, HEADER_H / 2, lesson.title, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5).setDepth(30);

    // Scrollable content container — y = SCROLL_TOP initially (no scroll)
    this.contentContainer = this.add.container(0, SCROLL_TOP).setDepth(29);

    // Geometry mask clips content to the scroll viewport
    const maskGfx = this.make.graphics({ add: false });
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(0, SCROLL_TOP, 800, VISIBLE_H);
    this.contentContainer.setMask(maskGfx.createGeometryMask());

    // Render lesson sections and measure total height
    this.totalContentH = this.renderContent(lesson.sections);

    // CONTINUE button — starts dimmed/locked
    this.continueBtn = this.add.text(400, 432, '> CONTINUE', {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#444444',
      backgroundColor: '#111111',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(30);

    // Scroll divider line
    this.add.graphics().lineStyle(1, 0xffd700, 0.3).lineBetween(0, FOOTER_Y, 800, FOOTER_Y).setDepth(29);

    // Mouse wheel scrolling
    this.input.on('wheel', (_ptr, _objs, _dx, deltaY) => {
      this.scroll(deltaY * 0.5);
    });

    // Unlock: 4 second timer
    this.time.delayedCall(4000, () => this.unlockContinue());

    // 100ms click guard
    this.time.delayedCall(100, () => {
      this.clickEnabled = true;
    });
  }

  scroll(amount) {
    const minY = SCROLL_TOP - Math.max(0, this.totalContentH - VISIBLE_H + 20);
    const maxY = SCROLL_TOP;
    this.contentContainer.y = Phaser.Math.Clamp(this.contentContainer.y - amount, minY, maxY);
    this.checkScrollProgress();
  }

  checkScrollProgress() {
    const minY = SCROLL_TOP - Math.max(0, this.totalContentH - VISIBLE_H + 20);
    // Unlock when within 120px of the bottom
    if (this.contentContainer.y <= minY + 120) {
      this.unlockContinue();
    }
  }

  unlockContinue() {
    if (this.continueUnlocked) return;
    this.continueUnlocked = true;
    this.continueBtn
      .setColor('#000000')
      .setBackgroundColor('#ffd700')
      .setInteractive({ useHandCursor: true });
    this.continueBtn.on('pointerover', () => this.continueBtn.setColor('#333333'));
    this.continueBtn.on('pointerout', () => this.continueBtn.setColor('#000000'));
    this.continueBtn.on('pointerdown', () => {
      if (!this.clickEnabled) return;
      this.closeLesson();
    });
  }

  closeLesson() {
    gameState.lessonOpen = false;
    this.game.events.emit('LESSON_CLOSED', { triggerId: this.triggerId });
    this.scene.stop();
  }

  /**
   * Renders all lesson sections into this.contentContainer.
   * Returns the total height of all rendered content.
   */
  renderContent(sections) {
    let yPos = 16; // top padding inside container

    for (const block of sections) {
      switch (block.type) {
        case 'header':
          yPos = this.renderHeader(block, yPos);
          break;
        case 'body':
          yPos = this.renderBody(block, yPos);
          break;
        case 'code':
          yPos = this.renderCode(block, yPos);
          break;
        case 'callout':
          yPos = this.renderCallout(block, yPos);
          break;
        default:
          break;
      }
    }
    return yPos + 16;
  }

  renderHeader(block, yPos) {
    const t = this.add.text(PAD_X, yPos, block.text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '9px',
      color: '#ffd700',
      wordWrap: { width: CONTENT_W },
    });
    this.contentContainer.add(t);
    return yPos + t.height + 14;
  }

  renderBody(block, yPos) {
    const t = this.add.text(PAD_X, yPos, block.text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#dddddd',
      wordWrap: { width: CONTENT_W },
      lineSpacing: 5,
    });
    this.contentContainer.add(t);
    return yPos + t.height + 12;
  }

  renderCode(block, yPos) {
    const t = this.add.text(PAD_X + 12, yPos + 10, block.text, {
      fontFamily: 'Courier New, monospace',
      fontSize: '9px',
      color: '#00ff88',
      wordWrap: { width: CONTENT_W - 24 },
      lineSpacing: 5,
    });
    const bgH = t.height + 20;
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x050510, 1);
    bgGfx.fillRect(PAD_X, yPos, CONTENT_W, bgH);
    bgGfx.lineStyle(1, 0x003322, 1);
    bgGfx.strokeRect(PAD_X, yPos, CONTENT_W, bgH);
    // Add bg before text so text renders on top
    this.contentContainer.add(bgGfx);
    this.contentContainer.add(t);
    return yPos + bgH + 14;
  }

  renderCallout(block, yPos) {
    const t = this.add.text(PAD_X + 12, yPos + 10, block.text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#ffd700',
      wordWrap: { width: CONTENT_W - 24 },
      lineSpacing: 5,
    });
    const bgH = t.height + 20;
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x1a1500, 1);
    bgGfx.fillRect(PAD_X, yPos, CONTENT_W, bgH);
    bgGfx.lineStyle(1, 0xffd700, 0.7);
    bgGfx.strokeRect(PAD_X, yPos, CONTENT_W, bgH);
    this.contentContainer.add(bgGfx);
    this.contentContainer.add(t);
    return yPos + bgH + 14;
  }
}
