import Phaser from 'phaser';
import gameState from '../gameState.js';

const BOX_Y = 337;
const BOX_H = 113;
const BOX_W = 800;

export default class DialogSystem extends Phaser.Scene {
  constructor() {
    super({ key: 'DialogSystem' });
  }

  init(data) {
    this.lines = data.lines || [];
    this.triggerId = data.triggerId || '';
    this.currentLine = 0;
    this.isTyping = false;
    this.isWaiting = false;
    this.clickEnabled = false;
    this.typeTimer = null;
  }

  create() {
    // Semi-transparent backdrop
    const bg = this.add.graphics().setDepth(10);
    bg.fillStyle(0x000000, 0.88);
    bg.fillRoundedRect(0, BOX_Y, BOX_W, BOX_H, 6);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(1, BOX_Y + 1, BOX_W - 2, BOX_H - 2, 6);

    // Portrait placeholder (texture set per-line)
    this.portrait = this.add
      .image(58, BOX_Y + BOX_H / 2, '__DEFAULT')
      .setDisplaySize(76, 76)
      .setDepth(11)
      .setVisible(false);

    // Speaker name
    this.speakerText = this.add
      .text(110, BOX_Y + 10, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#ffd700',
      })
      .setDepth(11);

    // Dialog body
    this.bodyText = this.add
      .text(110, BOX_Y + 30, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
        wordWrap: { width: 670 },
        lineSpacing: 5,
      })
      .setDepth(11);

    // Blinking advance arrow
    this.arrow = this.add
      .text(782, BOX_Y + BOX_H - 14, '▼', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffd700',
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setVisible(false);

    this.tweens.add({
      targets: this.arrow,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // 100ms click guard prevents the click that opened dialog from immediately advancing it
    this.time.delayedCall(100, () => {
      this.clickEnabled = true;
    });

    this.input.on('pointerdown', this.onPointerDown, this);
    this.showLine(0);
  }

  showLine(index) {
    if (index >= this.lines.length) {
      this.closeDialog();
      return;
    }

    const line = this.lines[index];
    this.currentLine = index;
    this.isTyping = true;
    this.isWaiting = false;
    this.arrow.setVisible(false);

    // Speaker
    this.speakerText.setText(line.speaker || '');

    // Portrait
    if (line.portrait && this.textures.exists(line.portrait)) {
      this.portrait.setTexture(line.portrait).setDisplaySize(76, 76).setVisible(true);
    } else {
      this.portrait.setVisible(false);
    }

    // Typewriter effect
    const fullText = line.text || '';
    let charIndex = 0;
    this.bodyText.setText('');

    if (this.typeTimer) {
      this.typeTimer.remove();
      this.typeTimer = null;
    }

    this.typeTimer = this.time.addEvent({
      delay: 40,
      callback: () => {
        charIndex++;
        this.bodyText.setText(fullText.slice(0, charIndex));
        if (charIndex >= fullText.length) {
          this.isTyping = false;
          this.isWaiting = true;
          this.arrow.setVisible(true);
          this.typeTimer = null;
        }
      },
      repeat: fullText.length - 1,
    });
  }

  onPointerDown() {
    if (!this.clickEnabled) return;

    if (this.isTyping) {
      // Skip to end of current line
      if (this.typeTimer) {
        this.typeTimer.remove();
        this.typeTimer = null;
      }
      this.bodyText.setText(this.lines[this.currentLine].text || '');
      this.isTyping = false;
      this.isWaiting = true;
      this.arrow.setVisible(true);
    } else if (this.isWaiting) {
      this.showLine(this.currentLine + 1);
    }
  }

  closeDialog() {
    gameState.dialogOpen = false;
    this.game.events.emit('DIALOG_CLOSED', { triggerId: this.triggerId });
    this.scene.stop();
  }
}
