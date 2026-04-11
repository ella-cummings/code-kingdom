import Phaser from 'phaser';
import { chiptunePlayer } from '../systems/ChiptunePlayer.js';

const TRACK_LX  = 718;
const TRACK_Y   = 24;
const TRACK_W   = 68;
const MAX_VOL   = 0.2;
const INIT_RATIO = 0.07 / MAX_VOL; // matches ChiptunePlayer default gain

export default class VolumeSlider extends Phaser.Scene {
  constructor() {
    super({ key: 'VolumeSlider' });
  }

  create() {
    // ♪ icon
    this.add.text(700, TRACK_Y, '♪', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(10);

    // Track background
    this.add.rectangle(TRACK_LX + TRACK_W / 2, TRACK_Y, TRACK_W, 4, 0x666666)
      .setDepth(10);

    // Gold filled portion
    const fill = this.add.rectangle(
      TRACK_LX, TRACK_Y, INIT_RATIO * TRACK_W, 4, 0xffd700,
    ).setOrigin(0, 0.5).setDepth(11);

    // Draggable handle
    const handle = this.add.rectangle(
      TRACK_LX + INIT_RATIO * TRACK_W, TRACK_Y, 8, 16, 0xffd700,
    ).setDepth(12).setInteractive({ useHandCursor: true, draggable: true });

    handle.on('drag', (_ptr, dragX) => {
      const x     = Phaser.Math.Clamp(dragX, TRACK_LX, TRACK_LX + TRACK_W);
      const ratio = (x - TRACK_LX) / TRACK_W;
      handle.x   = x;
      fill.width = x - TRACK_LX;
      chiptunePlayer.setVolume(ratio * MAX_VOL);
    });
  }
}
