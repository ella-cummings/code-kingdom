import Phaser from 'phaser';

import HomeScreen from './scenes/HomeScreen.js';
import CutsceneBackstory from './scenes/CutsceneBackstory.js';
import Level1_Village from './scenes/Level1_Village.js';
import Level2_Cauldron from './scenes/Level2_Cauldron.js';
import Level3_Forest from './scenes/Level3_Forest.js';
import Level4_Mountain from './scenes/Level4_Mountain.js';
import Level5_Castle from './scenes/Level5_Castle.js';
import EndScreen from './scenes/EndScreen.js';
import DialogSystem from './systems/DialogSystem.js';
import QuestionPopup from './systems/QuestionPopup.js';
import LessonScreen from './systems/LessonScreen.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  pixelArt: true,
  dom: {
    createContainer: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    HomeScreen,
    CutsceneBackstory,
    Level1_Village,
    Level2_Cauldron,
    Level3_Forest,
    Level4_Mountain,
    Level5_Castle,
    EndScreen,
    DialogSystem,
    QuestionPopup,
    LessonScreen,
  ],
};

new Phaser.Game(config);
