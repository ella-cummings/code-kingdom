import Phaser from 'phaser';
import gameState from '../gameState.js';
import { transitionTo } from '../utils/sceneHelpers.js';
import { BRIDGE_NARRATIVE, STONECUTTER_BRIDGE_BUILT } from '../data/dialogData.js';
import { MOUNTAIN_Q1, MOUNTAIN_Q2 } from '../data/questionData.js';

const LEVEL_WIDTH  = 2000;
const GROUND_Y     = 365;
const PLAYER_SPEED = 180;
const JUMP_VEL     = -370;
const WALK_MS      = 200;
const TALK_RANGE   = 100;
const CHEST_X      = 210;   // just right of player start (x=120)
const BARRIER_X    = 900;   // invisible wall at chasm

export default class Level4_Mountain extends Phaser.Scene {
  constructor() {
    super({ key: 'Level4_Mountain' });
  }

  preload() {
    // 20.png = starting bg (chasm, no bridge); 19.png = bridge complete
    if (!this.textures.exists('mountain_bg'))        this.load.image('mountain_bg',        'assets/20.png');
    if (!this.textures.exists('mountain_bridge_bg')) this.load.image('mountain_bridge_bg', 'assets/19.png');
    if (!this.textures.exists('player_idle'))        this.load.image('player_idle',        'assets/1.png');
    if (!this.textures.exists('player_walk'))        this.load.image('player_walk',        'assets/2.png');
    if (!this.textures.exists('chest'))              this.load.image('chest',              'assets/7.png');
    if (!this.textures.exists('pile'))               this.load.image('pile',               'assets/12.png');
  }

  create() {
    gameState.currentLevel = 'level4';

    // ── Background (20.png — chasm, no bridge yet) ────────────────────────────
    const bgScale = Math.max(800 / 1528, 450 / 863);
    this.bgTile = this.add
      .tileSprite(0, 0, 800, 450, 'mountain_bg')
      .setOrigin(0, 0)
      .setDepth(0)
      .setScrollFactor(0)
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

    // ── Invisible barrier at chasm ─────────────────────────────────────────────
    this.barrier = this.physics.add.staticGroup();
    this.barrier
      .create(BARRIER_X, GROUND_Y - 75, null)
      .setDisplaySize(20, 150)
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
    this.barrierCollider = this.physics.add.collider(this.player, this.barrier);
    this.walkFrame = 0;
    this.walkTimer = 0;

    // ── Camera ────────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, 800, 450);
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

    // ── Clouds ────────────────────────────────────────────────────────────────
    this.createClouds();

    // ── Chest ─────────────────────────────────────────────────────────────────
    this.chest = this.add.image(CHEST_X, GROUND_Y, 'chest')
      .setScale(0.07)
      .setOrigin(0.5, 1)
      .setDepth(3);

    this.chestLabel = this.add.text(CHEST_X, GROUND_Y - 62, '[ E ] OPEN', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(5).setVisible(false);

    // Pile replaces chest after Q1
    this.pile = this.add.image(CHEST_X, GROUND_Y, 'pile')
      .setScale(0.07)
      .setOrigin(0.5, 1)
      .setDepth(3)
      .setVisible(false);

    // ── Bridge planks (5 planks drawn at chasm, revealed one by one on Q2 correct) ─
    this.planks = [];
    for (let i = 0; i < 5; i++) {
      const plank = this.add.rectangle(
        BARRIER_X - 48 + i * 24, GROUND_Y - 8,
        20, 14, 0x8b6914,
      )
        .setDepth(3)
        .setAlpha(0)
        .setStrokeStyle(1, 0x5a4000);
      this.planks.push(plank);
    }

    // ── Level title ───────────────────────────────────────────────────────────
    this.showLevelTitle('Level 4: Loop Mountain');

    // ── Interaction state ─────────────────────────────────────────────────────
    this.interactionStep = null;
    this.chestUnlocked = false; // true after lesson closes
    this.chestOpened   = false;
    this.autoWalking   = false; // true after bridge dialog — player walks to other side

    this.game.events.on('DIALOG_CLOSED',   this.onDialogClosed,   this);
    this.game.events.on('LESSON_CLOSED',   this.onLessonClosed,   this);
    this.game.events.on('QUESTION_CLOSED', this.onQuestionClosed, this);

    // Auto-open Lesson 4
    this.time.delayedCall(1200, () => {
      this.interactionStep = 'lesson4';
      gameState.lessonOpen = true;
      this.scene.launch('LessonScreen', { lessonId: 'lesson4', triggerId: 'lesson4' });
    });
  }

  // ── Bridge planks animation (simulates loop running 5 times) ─────────────

  animatePlanks(onDone) {
    let placed = 0;
    const placeNext = () => {
      if (placed >= this.planks.length) {
        onDone();
        return;
      }
      const plank = this.planks[placed++];
      plank.y -= 30;
      plank.setAlpha(1);
      this.tweens.add({
        targets: plank,
        y: plank.y + 30,
        duration: 250,
        ease: 'Bounce.easeOut',
        onComplete: () => this.time.delayedCall(150, placeNext),
      });
      this.cameras.main.flash(80, 255, 220, 100);
    };
    placeNext();
  }

  buildBridge() {
    gameState.bridgeBuilt = true;

    this.barrierCollider.destroy();
    this.barrier.clear(true, true);

    // Fade out pile now that bridge is built
    this.tweens.add({ targets: this.pile, alpha: 0, duration: 400 });

    // Cross-fade bg from 20.png (chasm) → 19.png (bridge complete)
    this.tweens.add({
      targets: this.bgTile,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.bgTile.setTexture('mountain_bridge_bg').setAlpha(1);
        // Hide drawn planks — bg now shows the full bridge
        this.planks.forEach(p => p.setAlpha(0));
      },
    });

    this.cameras.main.flash(600, 255, 255, 200);
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  onLessonClosed({ triggerId }) {
    if (triggerId !== 'lesson4') return;
    gameState.lesson4Viewed = true;
    this.interactionStep = null;
    this.chestUnlocked = true;
  }

  onDialogClosed({ triggerId }) {
    if (triggerId === 'bridge_narrative') {
      // After narrative, launch the for-loop question
      this.interactionStep = 'mountain_q2';
      gameState.questionOpen = true;
      this.scene.launch('QuestionPopup', MOUNTAIN_Q2);
    } else if (triggerId === 'sc_bridge_built') {
      // Player auto-walks across the bridge — transition fires in update()
      this.autoWalking = true;
    }
  }

  onQuestionClosed({ correct }) {
    if (!correct) return;

    if (this.interactionStep === 'mountain_q1') {
      gameState.answeredQ1_L4 = true;

      // Chest sparkle then swap to pile
      this.chestSparkle();
      this.time.delayedCall(600, () => {
        this.chest.setVisible(false);
        this.chestLabel.setVisible(false);
        this.pile.setVisible(true);

        // Bounce tween on pile appearing
        this.pile.setScale(0.04);
        this.tweens.add({
          targets: this.pile,
          scaleX: 0.07,
          scaleY: 0.07,
          duration: 300,
          ease: 'Back.easeOut',
        });

        // Show bridge narrative instruction at bottom
        this.time.delayedCall(500, () => {
          this.interactionStep = 'bridge_narrative';
          gameState.dialogOpen = true;
          this.scene.launch('DialogSystem', { lines: BRIDGE_NARRATIVE, triggerId: 'bridge_narrative' });
        });
      });

    } else if (this.interactionStep === 'mountain_q2') {
      gameState.answeredQ2_L4 = true;

      // Animate 5 planks (one per loop iteration), then build bridge
      this.animatePlanks(() => {
        this.buildBridge();
        this.time.delayedCall(1400, () => {
          this.interactionStep = 'sc_bridge_built';
          gameState.dialogOpen = true;
          this.scene.launch('DialogSystem', { lines: STONECUTTER_BRIDGE_BUILT, triggerId: 'sc_bridge_built' });
        });
      });
    }
  }

  // ── Chest sparkle ─────────────────────────────────────────────────────────

  chestSparkle() {
    for (let i = 0; i < 10; i++) {
      const spark = this.add.rectangle(
        this.chest.x + Phaser.Math.Between(-25, 25),
        this.chest.y - Phaser.Math.Between(10, 60),
        5, 5, 0xffd700,
      ).setDepth(6);
      this.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(20, 50),
        alpha: 0,
        duration: Phaser.Math.Between(400, 800),
        onComplete: () => spark.destroy(),
      });
    }
    this.cameras.main.flash(200, 255, 220, 50);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(_time, delta) {
    // ── Auto-walk across bridge after it's built ───────────────────────────
    if (this.autoWalking) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
      this.walkTimer += delta;
      if (this.walkTimer >= WALK_MS) {
        this.walkTimer = 0;
        this.walkFrame = 1 - this.walkFrame;
        this.player.setTexture(this.walkFrame === 0 ? 'player_idle' : 'player_walk');
      }
      // Trigger transition once clearly past the bridge
      if (this.player.x > 500) {
        this.autoWalking = false;
        transitionTo(this, 'Level5_Castle');
      }
      return;
    }

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

    // Chest [E] OPEN label
    const nearChest = this.chestUnlocked && !this.chestOpened &&
                      this.interactionStep === null &&
                      Math.abs(this.player.x - CHEST_X) < TALK_RANGE;
    this.chestLabel.setVisible(nearChest);

    if (talk && nearChest) {
      this.chestOpened = true;
      this.chestLabel.setVisible(false);
      this.interactionStep = 'mountain_q1';
      gameState.questionOpen = true;
      this.scene.launch('QuestionPopup', MOUNTAIN_Q1);
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
