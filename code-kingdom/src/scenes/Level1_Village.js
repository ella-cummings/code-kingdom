import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import {
  VILLAGER1_GREETING,  VILLAGER1_POST_LESSON,
  VILLAGER2_PRE_Q1,    VILLAGER2_POST_Q1,
  VILLAGER3_PRE_Q2,    VILLAGER3_POST_Q2,
  VILLAGER4_PRE_Q3,    VILLAGER4_POST_Q3,
} from '../data/dialogData.js';
import { VILLAGE_Q1, VILLAGE_Q2, VILLAGE_Q3 } from '../data/questionData.js';

const LEVEL_WIDTH   = 3000;
const BG_SCALE      = 0.732;
const BG_TILE_Y     = 0;
const GROUND_Y      = 430;
const PLAYER_SPEED  = 180;
const JUMP_VELOCITY = -370;
const WALK_MS       = 200;
const TALK_RANGE    = 100;  // px proximity to show TALK indicator

const SCALE = {
  player:    0.062,
  villager1: 0.057,
  villager2: 0.052,
  villager3: 0.075,
  villager4: 0.050,
  cauldron:  0.058,
};

export default class Level1_Village extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1_Village' });
  }

  preload() {
    if (!this.textures.exists('village_bg')) this.load.image('village_bg', 'assets/17.png');
    this.load.image('player_idle', 'assets/1.png');
    this.load.image('player_walk', 'assets/2.png');
    this.load.image('villager1',   'assets/3.png');
    this.load.image('villager2',   'assets/16.png');
    this.load.image('villager3',   'assets/5.png');
    this.load.image('villager4',   'assets/8.png');
    this.load.image('cauldron',    'assets/9.png');
  }

  create() {
    gameState.currentLevel = 'level1';

    // ── Background (tiled, parallax) ──────────────────────────────────────────
    this.bgTile = this.add
      .tileSprite(0, 0, LEVEL_WIDTH, 450, 'village_bg')
      .setOrigin(0, 0)
      .setDepth(0)
      .setTileScale(BG_SCALE, BG_SCALE);
    this.bgTile.tilePositionY = BG_TILE_Y;

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
      .setScale(SCALE.player)
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

    // ── Clouds (screen-fixed) ─────────────────────────────────────────────────
    this.createClouds();

    // ── Cauldron (decorative only) ────────────────────────────────────────────
    this.add.image(2550, GROUND_Y, 'cauldron')
      .setScale(SCALE.cauldron)
      .setOrigin(0.5, 1)
      .setDepth(3);

    // ── NPCs ──────────────────────────────────────────────────────────────────
    this.interactionStep = null;
    this.spawnNPCs();

    // ── Level title banner ────────────────────────────────────────────────────
    this.showLevelTitle('Level 1: The Village');

    // ── Movement hint above player ────────────────────────────────────────────
    this.showMovementHint();

    // ── Global event listeners ────────────────────────────────────────────────
    this.game.events.on('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.on('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.on('QUESTION_CLOSED', this.onQuestionClosed, this);
  }

  showMovementHint() {
    // World-space text above the player's starting position
    const hintY = GROUND_Y - 90; // clears the player sprite top

    const text = this.add.text(this.player.x, hintY, '← → or A D to move\n  SPACE or W to jump', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    })
      .setOrigin(0.5, 1)
      .setDepth(6);

    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 500,
        ease: 'Linear',
        onComplete: () => text.destroy(),
      });
    });
  }

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

    // Pulse — same tween as HomeScreen start prompt
    const pulse = this.tweens.add({
      targets: text,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // After 3.5 s, stop pulsing and fade out over 600 ms then destroy
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

  // ── NPC Setup ─────────────────────────────────────────────────────────────
  spawnNPCs() {
    const defs = [
      { id: 'v1', key: 'villager1', x: 300,  scale: SCALE.villager1, locked: () => false },
      { id: 'v2', key: 'villager2', x: 900,  scale: SCALE.villager2, locked: () => false },
      { id: 'v3', key: 'villager3', x: 1600, scale: SCALE.villager3, locked: () => !gameState.talkedToVillager2 },
      { id: 'v4', key: 'villager4', x: 2300, scale: SCALE.villager4, locked: () => !gameState.talkedToVillager3 },
    ];

    this.npcs = defs.map(({ id, key, x, scale, locked }) => {
      const img = this.add.image(x, GROUND_Y, key)
        .setScale(scale)
        .setOrigin(0.5, 1)
        .setDepth(3);

      const labelY = GROUND_Y - img.displayHeight - 12;
      const label = this.add.text(x, labelY, '[ E ] TALK', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
        .setOrigin(0.5, 1)
        .setDepth(5)
        .setVisible(false);

      return { id, img, label, x, locked, done: false };
    });
  }

  // ── Interaction flows ─────────────────────────────────────────────────────

  talkToNPC(npc) {
    if (npc.done || this.interactionStep) return;
    switch (npc.id) {
      case 'v1':
        this.interactionStep = 'v1_greeting';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: VILLAGER1_GREETING, triggerId: 'v1_greeting' });
        break;
      case 'v2':
        this.interactionStep = 'v2_pre';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: VILLAGER2_PRE_Q1, triggerId: 'v2_pre' });
        break;
      case 'v3':
        this.interactionStep = 'v3_pre';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: VILLAGER3_PRE_Q2, triggerId: 'v3_pre' });
        break;
      case 'v4':
        this.interactionStep = 'v4_pre';
        gameState.dialogOpen = true;
        this.scene.launch('DialogSystem', { lines: VILLAGER4_PRE_Q3, triggerId: 'v4_pre' });
        break;
    }
  }

  onDialogClosed({ triggerId }) {
    switch (triggerId) {

      // ── Villager 1 ──────────────────────────────────────────────────────────
      case 'v1_greeting':
        this.interactionStep = 'v1_lesson';
        gameState.lessonOpen = true;
        this.scene.launch('LessonScreen', { lessonId: 'lesson1', triggerId: 'lesson1' });
        break;

      case 'v1_post':
        this.npcs.find(n => n.id === 'v1').done = true;
        this.interactionStep = null;
        break;

      // ── Villager 2 ──────────────────────────────────────────────────────────
      case 'v2_pre':
        this.interactionStep = 'v2_question';
        gameState.questionOpen = true;
        this.scene.launch('QuestionPopup', VILLAGE_Q1);
        break;

      case 'v2_post':
        gameState.talkedToVillager2 = true;
        this.npcs.find(n => n.id === 'v2').done = true;
        this.interactionStep = null;
        break;

      // ── Villager 3 ──────────────────────────────────────────────────────────
      case 'v3_pre':
        this.interactionStep = 'v3_question';
        gameState.questionOpen = true;
        this.scene.launch('QuestionPopup', VILLAGE_Q2);
        break;

      case 'v3_post':
        gameState.talkedToVillager3 = true;
        this.npcs.find(n => n.id === 'v3').done = true;
        this.interactionStep = null;
        break;

      // ── Villager 4 (Witch) ───────────────────────────────────────────────────
      case 'v4_pre':
        this.interactionStep = 'v4_question';
        gameState.questionOpen = true;
        this.scene.launch('QuestionPopup', VILLAGE_Q3);
        break;

      case 'v4_post':
        this.npcs.find(n => n.id === 'v4').done = true;
        this.interactionStep = null;
        this.time.delayedCall(500, () => transitionTo(this, 'Level2_Cauldron'));
        break;
    }
  }

  onLessonClosed({ triggerId }) {
    if (triggerId !== 'lesson1') return;
    gameState.lesson1Viewed = true;
    this.interactionStep = 'v1_post';
    gameState.dialogOpen = true;
    this.scene.launch('DialogSystem', { lines: VILLAGER1_POST_LESSON, triggerId: 'v1_post' });
  }

  onQuestionClosed({ correct }) {
    if (!correct) return;

    if (this.interactionStep === 'v2_question') {
      this.interactionStep = 'v2_post';
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: VILLAGER2_POST_Q1, triggerId: 'v2_post' });

    } else if (this.interactionStep === 'v3_question') {
      this.interactionStep = 'v3_post';
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: VILLAGER3_POST_Q2, triggerId: 'v3_post' });

    } else if (this.interactionStep === 'v4_question') {
      this.interactionStep = 'v4_post';
      gameState.dialogOpen = true;
      this.scene.launch('DialogSystem', { lines: VILLAGER4_POST_Q3, triggerId: 'v4_post' });
    }
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

  // ── Update ────────────────────────────────────────────────────────────────
  update(time, delta) {
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

    if (left) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && this.player.body.blocked.down) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }

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

    // tilePositionX left at 0 — tileSprite in world space naturally matches NPC scroll speed

    // ── NPC proximity & TALK labels ──────────────────────────────────────────
    let nearNPC = null;
    const px = this.player.x;

    this.npcs.forEach((npc) => {
      const inRange = !npc.done && !npc.locked() && Math.abs(px - npc.x) < TALK_RANGE;
      npc.label.setVisible(inRange);
      if (inRange) nearNPC = npc;
    });

    if (talk && nearNPC) {
      this.talkToNPC(nearNPC);
    }
  }

  shutdown() {
    this.game.events.off('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.off('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.off('QUESTION_CLOSED', this.onQuestionClosed, this);
  }
}
