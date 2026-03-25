# Code Kingdom — Full Development Plan

> **Game:** Code Kingdom — A Java Adventure
> **Platform:** Web browser (HTML file served via Vite / npm)
> **Team:** 2 developers, Extreme Programming (pair on same machine)
> **Architecture Role:** This document is the authoritative design reference. All implementation decisions should be reconciled against it.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Tech Stack](#2-tech-stack)
3. [VSCode Setup & Extensions](#3-vscode-setup--extensions)
4. [Folder Structure](#4-folder-structure)
5. [Core Architecture Decisions](#5-core-architecture-decisions)
6. [Phase 1 — Core Infrastructure + Levels 1 & 2](#6-phase-1--core-infrastructure--levels-1--2)
7. [Phase 2 — Levels 3–5 + Audio + Polish](#7-phase-2--levels-35--audio--polish)
8. [Lesson Content Outlines (Units 1–4)](#8-lesson-content-outlines-units-14)
9. [Java Syntax Validator Design](#9-java-syntax-validator-design)
10. [Testing Checklist (Phase 1)](#10-testing-checklist-phase-1)
11. [XP Workflow & Pair Programming Notes](#11-xp-workflow--pair-programming-notes)

---

## 1. Project Summary

Code Kingdom is a 2D side-scrolling educational RPG that teaches Java programming to children ages 10–14. The player character (a "Code Knight") walks through five themed levels, talking to NPCs, reading lesson scrolls, and answering Java coding questions to progress. The final boss is a Bug Dragon defeated by answering enough questions to charge a fireball.

**Visual style:** Retro pixel art (Mario / Terraria aesthetic). All 21 art assets are provided as PNG files in `/context/`. No additional art generation is needed.

**Key constraints:**
- All text rendered in "Press Start 2P" (Google Fonts) pixel font
- 800×450px canvas, scales to fill browser window
- Java answers are validated structurally (syntax check), not by execution
- No audio in Phase 1

---

## 2. Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Game engine | **Phaser 3** | Scene management, physics, tweens, input, camera — ideal for this scope |
| Build tool / dev server | **Vite** | Fast HMR in WSL, native ES module support, minimal config |
| Language | **Vanilla JavaScript (ES Modules)** | No TypeScript overhead; Phaser 3 is fully compatible |
| Node version | npm (v24 installed) | Use `npm create vite@latest` to scaffold |
| Font | **Press Start 2P** via Google Fonts | Loaded in `index.html`, used for all game text |
| Java validator | **Custom regex-based structural parser** | Option B — validates syntax structure without execution |
| Package registry | npm | Phaser 3 installed as `npm install phaser` |

**Phaser version:** Install `phaser@3.60.0` (stable LTS — do not use v3.80+ until community plugins are verified compatible).

---

## 3. VSCode Setup & Extensions

### Essential — Install Before Starting

| Extension | ID | Purpose |
|---|---|---|
| **WSL** | `ms-vscode-remote.remote-wsl` | Run VSCode directly in WSL filesystem — critical for this setup |
| **ESLint** | `dbaeumer.vscode-eslint` | Catch JS errors in real time |
| **Prettier** | `esbenp.prettier-vscode` | Auto-format on save — keeps pair-programmed code consistent |
| **Error Lens** | `usernamehw.errorlens` | Inline error display — no need to hover on red squiggles |
| **Path Intellisense** | `christian-kohler.path-intellisense` | Autocomplete for asset file paths in `preload()` calls |
| **Live Share** | `ms-vsliveshare.vsliveshare` | Even on the same machine, Live Share lets both devs have their own cursor & follow mode during pairing |

### Recommended — Quality of Life

| Extension | ID | Purpose |
|---|---|---|
| **GitLens** | `eamodio.gitlens` | Inline blame, history — helpful for reviewing what each pair session changed |
| **Peacock** | `johnpapa.vscode-peacock` | Color-code the VSCode window — useful if you open two VSCode windows (one for game, one for data files) |
| **TODO Highlight** | `wayou.vscode-todo-highlight` | Highlights `TODO:` and `FIXME:` comments — keep a running list of known issues while pairing |
| **Better Comments** | `aaron-bond.better-comments` | Color-coded comments (`! danger`, `? question`, `* important`) — useful in complex scene files |
| **Import Cost** | `wix.vscode-import-cost` | Shows bundle size of each import — keep an eye on Phaser's weight |
| **JavaScript (ES6) Snippets** | `xabikos.javascriptsnippets` | Speed up boilerplate (class constructors, arrow functions) |

### Workspace Settings (`.vscode/settings.json`)

Create this file at project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.rulers": [100],
  "files.eol": "\n",
  "prettier.singleQuote": true,
  "prettier.semi": true,
  "prettier.trailingComma": "es5",
  "eslint.validate": ["javascript"],
  "editor.wordWrap": "wordWrapColumn",
  "editor.wordWrapColumn": 100
}
```

> **WSL Note:** Always open VSCode from within WSL (`code .` in the terminal) — not by double-clicking in Windows Explorer. Opening from Windows will cause file permission and hot-reload issues with Vite.

---

## 4. Folder Structure

```
/code-kingdom
  /assets
    1.png  …  21.png          ← copy from /context/ at project setup
  /src
    main.js                   ← Phaser game config + scene registration
    gameState.js              ← global singleton state object
    /scenes
      HomeScreen.js
      CutsceneBackstory.js
      Level1_Village.js
      Level2_Cauldron.js
      Level3_Forest.js        ← Phase 2
      Level4_Mountain.js      ← Phase 2
      Level5_Castle.js        ← Phase 2
      EndScreen.js            ← Phase 2
    /systems
      DialogSystem.js
      QuestionPopup.js
      LessonScreen.js
      JavaSyntaxValidator.js
    /data
      lessonContent.js        ← all 4 unit lesson texts (structured objects)
      questionData.js         ← all question objects (named exports)
      dialogData.js           ← all NPC dialog line arrays (named exports)
    /utils
      sceneHelpers.js         ← transitionTo(), floatingText()
  index.html
  vite.config.js
  .vscode/
    settings.json
  package.json
```

---

## 5. Core Architecture Decisions

### 5.1 Scene Modes — Parallel vs. Standard

| Scene | Launch Mode | Notes |
|---|---|---|
| All level scenes (HomeScreen → EndScreen) | `scene.start()` | Replaces current scene entirely |
| **DialogSystem** | `scene.launch()` parallel | Renders over gameplay; world stays visible during typewriter |
| **QuestionPopup** | `scene.launch()` parallel | Gameplay scene stays in memory for post-answer continuation |
| **LessonScreen** | `scene.launch()` parallel | Full-screen overlay; gameplay scene must persist |

### 5.2 Inter-Scene Communication

All overlay scenes communicate back to gameplay scenes via **Phaser's global event emitter** (`this.game.events`), not direct scene references.

```js
// DialogSystem — emit when last line is dismissed
this.game.events.emit('DIALOG_CLOSED', { triggerId: this.triggerId });

// Level1_Village — listen in create()
this.game.events.on('DIALOG_CLOSED', this.onDialogClosed, this);

// Level1_Village — MUST remove in shutdown() to prevent memory leak
shutdown() {
  this.game.events.off('DIALOG_CLOSED', this.onDialogClosed, this);
  this.game.events.off('QUESTION_CLOSED', this.onQuestionClosed, this);
  this.game.events.off('LESSON_CLOSED', this.onLessonClosed, this);
}
```

> **Critical:** The `triggerId` field in every event prevents cross-scene event collisions. Every dialog launch must include a unique `triggerId` string (e.g. `'villager1_greeting'`, `'village_q1'`). The receiving scene checks this before acting.

### 5.3 Movement Lock via gameState

Overlay scenes do NOT pause the gameplay scene. The gameplay `update()` loop keeps running. Player movement is gated by flags:

```js
// Top of every level's update()
if (gameState.dialogOpen || gameState.questionOpen || gameState.lessonOpen) return;
```

Set the flag to `true` immediately before calling `scene.launch()`, and set it back to `false` in the corresponding `_CLOSED` event handler.

### 5.4 Scene Transition Helper

All scene transitions use `transitionTo()` from `sceneHelpers.js` — never call `scene.start()` directly from level scenes.

```js
// sceneHelpers.js
export function transitionTo(scene, targetKey, data = {}) {
  scene.cameras.main.fadeOut(400, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', () => {
    // Stop all parallel overlay scenes before starting new scene
    scene.scene.stop('DialogSystem');
    scene.scene.stop('QuestionPopup');
    scene.scene.stop('LessonScreen');
    scene.scene.start(targetKey, data);
  });
}
```

### 5.5 gameState Singleton

`gameState.js` exports a plain ES module object. Because ES modules are singletons, every file that imports it gets the same reference — mutations are instantly visible across all scenes. Do not use Phaser's registry for this.

```js
// gameState.js
const gameState = {
  talkedToVillager1: false,
  talkedToVillager2: false,  // set ONLY after V2 Q1 correct + post-dialog complete
  talkedToVillager3: false,
  talkedToVillager4: false,
  lesson1Viewed: false, lesson2Viewed: false,
  lesson3Viewed: false, lesson4Viewed: false,
  answeredQ1_L1: false, answeredQ2_L1: false, answeredQ3_L1: false,
  answeredQ1_L2: false, answeredQ2_L2: false, answeredQ3_L2: false,
  answeredQ1_L3: false, answeredQ2_L3: false, answeredQ3_L3: false,
  answeredQ1_L4: false, answeredQ2_L4: false,
  mountainQ2Attempts: 0,
  mountainQ2Revealed: false,
  bridgeBuilt: false,
  fireballCharges: 0,
  dragonDefeated: false,
  dialogOpen: false,
  questionOpen: false,
  lessonOpen: false,
  currentLevel: 'home'
};
export default gameState;
```

> **Flag sequencing in Level 1:** `gameState.talkedToVillager2` must be set only after the entire V2 interaction resolves: V2 dialog → Q1 correct → V2 post-Q1 dialog → `DIALOG_CLOSED` fires → set flag. Setting it earlier breaks the NPC lock chain.

---

## 6. Phase 1 — Core Infrastructure + Levels 1 & 2

Phase 1 delivers a fully playable game from the Home Screen through the end of Level 2 (Cauldron). All reusable systems are built here and will be reused without modification in Phase 2.

### Milestone Map

```
M1: Project scaffold + asset pipeline
M2: Core systems (Dialog, QuestionPopup, LessonScreen, Validator)
M3: Player movement + gameState
M4: HomeScreen + Cutscene
M5: Level 1 — Village (full NPC chain)
M6: Level 2 — Cauldron (full cauldron sequence)
M7: Phase 1 integration test
```

---

### M1 — Project Scaffold + Asset Pipeline

**Tasks:**
1. Scaffold Vite project: `npm create vite@latest code-kingdom -- --template vanilla`
2. `cd code-kingdom && npm install phaser@3.60.0`
3. Create folder structure as defined in Section 4
4. Copy all PNGs from `/context/` into `/assets/`
5. Set up `index.html`: load Press Start 2P from Google Fonts, set canvas container div
6. Configure `vite.config.js` for `/assets/` path resolution
7. Write minimal `main.js` with Phaser config and empty scene stubs for all scenes
8. Confirm Phaser renders in browser (`npm run dev` → `http://localhost:5173`)
9. Create `.vscode/settings.json` with workspace config

**Deliverable:** Browser opens, Phaser canvas renders with `backgroundColor: '#1a1a2e'`. All 21 PNG filenames verified present in `/assets/`.

---

### M2 — Core Systems

Build all four core systems in this order. Each is independently testable before the next begins.

#### 2a — `JavaSyntaxValidator.js`
*(Build first — no dependencies, testable in browser console immediately)*

See Section 9 for full design. Implement both rule handlers (`println`, `for_bridge`). Test manually in the browser console before any other work.

#### 2b — `DialogSystem.js`

**Data contract (launch call):**
```js
this.scene.launch('DialogSystem', {
  lines: [
    { speaker: 'Villager 1', portrait: 'villager1', text: '...' }
  ],
  triggerId: 'villager1_greeting'
});
gameState.dialogOpen = true;
```

**Implementation notes:**
- Dark semi-transparent rounded rectangle: y=337, width=800, height=113, fill black alpha 0.85, gold border
- Portrait image at left (~80×80px) — texture key passed in data, must be preloaded by the calling scene
- Speaker name in yellow, size 10px "Press Start 2P"
- Dialog text in white, size 8px, word-wrapped at 620px, right of portrait
- Blinking ▼ arrow: tween alpha 1→0 every 500ms
- Typewriter: 40ms per character; clicking mid-type shows full text instantly
- **100ms click guard:** `this.clickEnabled = false; this.time.delayedCall(100, () => { this.clickEnabled = true; });`
- On final line dismissed: `gameState.dialogOpen = false; this.game.events.emit('DIALOG_CLOSED', { triggerId }); this.scene.stop();`

#### 2c — `QuestionPopup.js`

**Data contract (launch call):**
```js
this.scene.launch('QuestionPopup', {
  ...VILLAGE_Q1,           // spread question object from questionData.js
  validator: 'println',    // for text_input only
  strikeLimit: null,       // null = infinite; 3 = Mountain Q2 only
  triggerId: 'village_q1'
});
gameState.questionOpen = true;
```

**Implementation notes:**
- Use `this.add.container(400, 225)` for the popup box — all children added to container so shake moves them together
- Parchment box: width 680px, background 0x2a1a0e, gold border, rounded corners
- **Multiple choice:** 3 stacked buttons (620×44px), dark brown bg, gold border on hover
- **Text input:** `this.add.dom()` with real HTML `<input>` element — requires `dom: { createContainer: true }` in Phaser config
- **100ms click guard** (same pattern as DialogSystem) — prevents click-through from prior dialog
- **Wrong answer shake:**
  ```js
  this.tweens.add({ targets: this.container, x: { from: 392, to: 408 }, duration: 50, yoyo: true, repeat: 2 });
  ```
- **Answer routing:** multiple_choice → direct compare; text_input → `JavaSyntaxValidator.validate(ruleId, input)`
- **3-strikes (Mountain Q2 only):** after 3 wrong, swap container content to reveal panel with blue background, code block, explanation, "GOT IT →" button
- On correct or GOT IT: `gameState.questionOpen = false; this.game.events.emit('QUESTION_CLOSED', { triggerId, correct: true, revealed: wasRevealed }); this.scene.stop();`
- On `QUESTION_CLOSED` in gameplay scene: handle `revealed` and `correct` identically for bridge logic

#### 2d — `LessonScreen.js`

**Data contract (launch call):**
```js
this.scene.launch('LessonScreen', {
  lessonId: 'lesson1',     // key into LESSONS object from lessonContent.js
  triggerId: 'lesson1'
});
gameState.lessonOpen = true;
```

**Implementation notes:**
- Full-screen opaque overlay: 0x0d0d1a
- Gold header bar (50px tall), unit title centered in black
- **Scrollable content:** use a `Phaser.GameObjects.Container` clipped by a `GeometryMask`
- Mouse wheel handler: `this.input.on('wheel', ...)` — translate container y, clamp to content bounds
- Content blocks rendered from `LESSONS[lessonId].sections` array (see Section 8):
  - `header` → yellow, 9px
  - `body` → white, 7px, line height 18px
  - `code` → green (#00FF88), Courier New, dark box background (0x0a0a14)
  - `callout` → tinted background + gold border
- **CONTINUE → button** unlock: two independent conditions, both call `unlockContinue()`:
  1. `this.time.delayedCall(4000, unlockContinue)`
  2. Scroll progress check: `if (scrollY <= -(totalHeight - visibleHeight - 100)) unlockContinue()`
  - `this.continueUnlocked` boolean prevents double-unlock
- On CONTINUE clicked: `gameState.lessonOpen = false; this.game.events.emit('LESSON_CLOSED', { triggerId }); this.scene.stop();`

---

### M3 — Player Movement System

Implemented inside each level scene (not a separate scene/system — it's a few methods on the level class).

**Setup:**
```js
// In preload()
this.load.image('player_idle', 'assets/1.png');
this.load.image('player_walk', 'assets/2.png');

// In create()
this.player = this.physics.add.sprite(100, 380, 'player_idle');
this.player.setScale(2.5).setOrigin(0.5, 1.0).setDepth(4);
this.physics.world.gravity.y = 800;
const ground = this.physics.add.staticGroup();
ground.create(LEVEL_WIDTH / 2, 420, null)
  .setDisplaySize(LEVEL_WIDTH, 20).refreshBody().setVisible(false);
this.physics.add.collider(this.player, ground);
this.cursors = this.input.keyboard.addKeys({
  left: Phaser.Input.Keyboard.KeyCodes.LEFT,
  right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  up: Phaser.Input.Keyboard.KeyCodes.UP,
  a: Phaser.Input.Keyboard.KeyCodes.A,
  d: Phaser.Input.Keyboard.KeyCodes.D,
  w: Phaser.Input.Keyboard.KeyCodes.W
});
this.walkFrame = 0;
this.walkTimer = 0;
```

**Update loop:**
```js
update(time, delta) {
  if (gameState.dialogOpen || gameState.questionOpen || gameState.lessonOpen) return;

  const left  = this.cursors.left.isDown  || this.cursors.a.isDown;
  const right = this.cursors.right.isDown || this.cursors.d.isDown;
  const jump  = this.cursors.up.isDown    || this.cursors.w.isDown;

  if (left)       { this.player.setVelocityX(-160); this.player.setFlipX(true); }
  else if (right) { this.player.setVelocityX(160);  this.player.setFlipX(false); }
  else            { this.player.setVelocityX(0); }

  if (jump && this.player.body.blocked.down) this.player.setVelocityY(-300);

  const moving = left || right;
  if (moving) {
    this.walkTimer += delta;
    if (this.walkTimer >= 200) {
      this.walkTimer = 0;
      this.walkFrame = 1 - this.walkFrame;
      this.player.setTexture(this.walkFrame === 0 ? 'player_idle' : 'player_walk');
    }
  } else {
    this.player.setTexture('player_idle');
    this.walkTimer = 0;
  }

  this.checkNPCProximity();
}
```

**Camera:**
```js
this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 450);
this.cameras.main.startFollow(this.player, true, 0.1, 0); // lerp horizontal only
```

---

### M4 — HomeScreen + CutsceneBackstory

#### HomeScreen
- Background: `17.png` scaled to fill screen
- Title: "CODE KINGDOM" in yellow Press Start 2P with drop shadow
- Subtitle: "A Java Adventure" in white
- Pulsing text: `this.tweens.add({ targets: clickText, scaleX: {from:1, to:1.05}, yoyo: true, repeat: -1, duration: 600 })`
- Cloud animation: horizontal tween on a few cloud sprites, `repeat: -1`, `yoyo: false`, `modulo` wrap on x
- Input: `this.input.once('pointerdown', () => transitionTo(this, 'CutsceneBackstory'))`
- Camera fade-in on create: `this.cameras.main.fadeIn(400, 0, 0, 0)`

#### CutsceneBackstory
- Background: `17.png` with dark overlay (`0x000000`, alpha 0.5)
- Use DialogSystem with 6 dialog lines (speaker: `'Narrator'`, portrait: `'player_idle'`)
- All 6 lines stored in `dialogData.js` as `BACKSTORY_LINES`
- On `DIALOG_CLOSED` with `triggerId: 'backstory'`: `this.time.delayedCall(1000, () => transitionTo(this, 'Level1_Village'))`

---

### M5 — Level 1: The Village

**Level width:** 3000px
**NPC positions:** Villager1=300, Villager2=900, Villager3=1600, Villager4=2300, Cauldron=2500

#### NPC Setup Pattern (repeat for each NPC):
```js
// In create()
this.villager1 = this.physics.add.staticSprite(300, 400, 'villager1').setScale(2).setDepth(3);
this.villager1.setInteractive();
this.villager1.on('pointerdown', () => this.onClickVillager1());

// Proximity indicator (floating ! or TALK bubble)
this.v1Indicator = this.add.text(300, 340, '[TALK]', { font: '8px Press Start 2P', fill: '#ffffff' })
  .setOrigin(0.5).setDepth(5).setVisible(false);
this.tweens.add({ targets: this.v1Indicator, y: 335, yoyo: true, repeat: -1, duration: 800 });
```

**Proximity check (in `checkNPCProximity()` called from `update()`):**
```js
const d1 = Math.abs(this.player.x - this.villager1.x);
this.v1Indicator.setVisible(d1 < 80);
```

**NPC lock system:**
```js
onClickVillager3() {
  if (!gameState.talkedToVillager2) {
    // Show floating lock text above player
    floatingText(this, this.player.x, this.player.y - 40, "I should talk to someone else first...");
    return;
  }
  // ... proceed with dialog
}
```

**`floatingText()` in `sceneHelpers.js`:**
```js
export function floatingText(scene, x, y, message) {
  const t = scene.add.text(x, y, message, { font: '7px Press Start 2P', fill: '#ffffff' }).setOrigin(0.5).setDepth(6);
  scene.tweens.add({ targets: t, y: y - 20, alpha: 0, duration: 1500, onComplete: () => t.destroy() });
}
```

#### Level 1 NPC Interaction Sequence

```
V1 clicked → DIALOG (villager1_greeting) → LESSON_CLOSED (lesson1)
           → DIALOG (villager1_post_lesson) → DIALOG_CLOSED
           → gameState.talkedToVillager1 = true

V2 clicked → DIALOG (villager2_pre_q1) → DIALOG_CLOSED
           → QUESTION (village_q1, type=text_input, validator='println') → QUESTION_CLOSED correct
           → DIALOG (villager2_post_q1) → DIALOG_CLOSED
           → gameState.talkedToVillager2 = true  ← SET HERE, not before

V3 clicked [locked until talkedToVillager2] → DIALOG (villager3_pre_q2) → DIALOG_CLOSED
           → QUESTION (village_q2, type=multiple_choice) → QUESTION_CLOSED correct
           → DIALOG (villager3_post_q2) → DIALOG_CLOSED
           → gameState.talkedToVillager3 = true

V4 clicked [locked until talkedToVillager3] → DIALOG (villager4_pre_q3) → DIALOG_CLOSED
           → QUESTION (village_q3, type=multiple_choice) → QUESTION_CLOSED correct
           → DIALOG (villager4_post_q3) → DIALOG_CLOSED
           → transitionTo('Level2_Cauldron')
```

All dialog content transcribed verbatim from `context/final-code-kingdom-prompt.md` into `dialogData.js`.

---

### M6 — Level 2: The Cauldron

**Background:** `17.png` (same village bg)
**Key assets:** Witch `8.png` at left of cauldron, Cauldron `9.png` prominent

**On scene load:**
1. Immediately launch LessonScreen for `lesson2`
2. On `LESSON_CLOSED`: open Witch post-lesson dialog
3. On `DIALOG_CLOSED`: begin Q1 (Moonpetal Flower)
4. On each `QUESTION_CLOSED correct`:
   - Play ingredient animation: ingredient icon floats into cauldron with a tween
   - Cauldron tint changes (green → purple → gold)
   - Witch speaks next line
5. After Q3 correct: Witch final dialog → `transitionTo('Level3_Forest')` *(Phase 2)*

**Cauldron sequence:**
```
LESSON_CLOSED → DIALOG (witch_post_lesson)
             → QUESTION (cauldron_q1, multiple_choice) → correct → ingredient anim → DIALOG (witch_q1_to_q2)
             → QUESTION (cauldron_q2, multiple_choice) → correct → ingredient anim → DIALOG (witch_q2_to_q3)
             → QUESTION (cauldron_q3, multiple_choice) → correct → ingredient anim → DIALOG (witch_final)
             → transitionTo('Level3_Forest')
```

**Ingredient animation (helper, called per question):**
```js
function animateIngredient(scene, iconKey, cauldron, nextTint) {
  const icon = scene.add.image(200, 150, iconKey).setScale(1.5).setDepth(6);
  scene.tweens.add({
    targets: icon,
    x: cauldron.x, y: cauldron.y,
    scaleX: 0, scaleY: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      icon.destroy();
      scene.tweens.add({ targets: cauldron, tint: nextTint, duration: 300 });
    }
  });
}
```

*(Ingredient icons can be generated as simple colored shapes if no separate asset exists — the spec says "generate graphics if needed" for missing elements.)*

---

### M7 — Phase 1 Integration Test

Run through the full Phase 1 test checklist in Section 10. Fix any issues before starting Phase 2.

---

## 7. Phase 2 — Levels 3–5 + Audio + Polish

Phase 2 adds the remaining levels and audio. All core systems from Phase 1 are reused unchanged.

### Phase 2 Milestones

| Milestone | Content |
|---|---|
| **M8** | Level 3: The Conditional Forest |
| **M9** | Level 4: Loop Mountain |
| **M10** | Level 5: The Castle + Boss Battle |
| **M11** | EndScreen |
| **M12** | Audio integration |
| **M13** | Polish, resize handling, final test |

---

### M8 — Level 3: The Conditional Forest

**Background:** `18.png` (forest bg), level width 2500px
**Assets:** Owl `10.png`, Signs `11.png` (×3), Rock `6.png`, Log `4.png`
**NPC positions:** Owl=250, Sign1=600, Rock=1100, Sign2=1150, Log=1700, Sign3=1750

**Sequence:**
```
Scene load → Owl intro dialog → LESSON_CLOSED (lesson3) → Owl post-lesson dialog
Sign1 clicked → QUESTION (forest_q1) → correct → reveal sign text "HEAD TO THE BIG ROCK" → rock sparkle
Sign2 clicked [near rock] → QUESTION (forest_q2) → correct → reveal "HEAD TO THE FALLEN LOG" → log sparkle
Sign3 clicked [near log] → QUESTION (forest_q3) → correct → reveal "PRESS ONWARD TO LOOP MOUNTAIN"
           → Owl farewell dialog → transitionTo('Level4_Mountain')
```

**Sign reveal mechanic:**
- Sign shows a `?` or locked graphic initially
- On correct answer, swap sign texture or add a text overlay with revealed direction
- Landmark (rock/log) sparkle: particle emitter burst or rapid tween alpha flicker

---

### M9 — Level 4: Loop Mountain

**Background:** `19.png` (mountain bg), level width 2000px
**Assets:** Chest `7.png` at x=500, Pile `12.png` (replaces chest after Q1)
**Invisible barrier at x=880:** static physics body, height=150 — removed when `gameState.bridgeBuilt = true`

**Sequence:**
```
Scene load → intro text overlay → LessonScreen (lesson4)
Chest clicked → QUESTION (mountain_q1, multiple_choice) → correct
             → chest disappears → pile appears at same position
             → QUESTION (mountain_q2, text_input, validator='for_bridge', strikeLimit=3)
             → QUESTION_CLOSED (correct OR revealed)
             → gameState.bridgeBuilt = true → remove barrier
             → background cross-fade from 19.png to 20.png
             → player walks right → transitionTo('Level5_Castle')
```

**3-strikes reveal panel (in QuestionPopup):**
```
After 3rd wrong answer: swap popup to blue bg, show answer in code block format,
show explanation, show "GOT IT →" button.
GOT IT click → emit QUESTION_CLOSED with { correct: true, revealed: true }
```

**Bridge cross-fade:**
```js
// Level4_Mountain.js — after bridgeBuilt
this.tweens.add({
  targets: this.bgImage,
  alpha: 0,
  duration: 1000,
  onComplete: () => {
    this.bgImage.setTexture('bridge_bg').setAlpha(1);
  }
});
```

---

### M10 — Level 5: The Castle (Boss Battle)

**Background:** `21.png` (castle interior), no horizontal scrolling
**Assets:** Bug Dragon `14.png` at x=600, y=280, scale=2x; Fireball `13.png` starts at x=150

**Sequence:**
```
Scene load → Dragon taunt dialog (4 lines) → boss battle UI appears
```

**Boss Battle UI:**
- Fireball charge bar: x=200, y=30, w=400, h=24 — fill starts at 0
- Fill color gradient: red-orange → orange → gold (use `Phaser.Display.Color.Interpolate`)
- "FIREBALL POWER" label in yellow above bar
- "X / 10" counter right of bar
- Large "⚡ CHARGE! ⚡" button: `tweens.add({ scaleX: {from:1.0, to:1.05}, yoyo:true, repeat:-1, duration:400 })`
- Fireball sprite starts at scale 0.5, reaches scale 1.0 at 10 charges

**On 10th click:**
```
1. Hide charge button
2. "FIRE!!" text for 500ms
3. Tween fireball x: 150 → 580, duration 600ms, ease Power2
4. On tween complete: hide fireball, swap dragon 14.png → 15.png
5. Scale explosion: 0.5 → 2.0 (400ms) → 1.5 (300ms) → alpha 0 (500ms)
6. Screen flash: add white full-screen rect, tween alpha 0→1 (100ms), hold 200ms, tween 1→0 (300ms)
7. Camera shake: this.cameras.main.shake(500, 0.015)
8. After 1500ms: transitionTo('EndScreen')
```

---

### M11 — EndScreen

**Background:** `17.png` with golden overlay/glow
**Sequence:**
1. Camera fade-in
2. "THE BUG DRAGON HAS BEEN DEFEATED!" title text
3. Victory declaration text (paragraph, scrollable or paginated)
4. Mentor sendoff in styled scroll box
5. Three project cards in a row (styled rectangles with header + body text)
6. "⭐ CONGRATULATIONS, CODE KNIGHT ⭐" and "You have completed the Java Coding Curriculum!"
7. "PLAY AGAIN" button → `transitionTo('HomeScreen')` + `Object.assign(gameState, initialState)` (reset all flags)

---

### M12 — Audio Integration

Source all audio from royalty-free 8-bit archives (OpenGameArt.org). Load as Phaser audio sprites or individual mp3/ogg files.

| Asset | Scene | Notes |
|---|---|---|
| Village/Home music loop | HomeScreen, Level1, Level2 | Volume cap 0.4 |
| Forest music loop | Level3 | Volume cap 0.4 |
| Mountain music loop | Level4 | Volume cap 0.4 |
| Castle/Boss music loop | Level5 | Volume cap 0.4 |
| Victory fanfare | EndScreen | Volume cap 0.4 |
| Dialog blip SFX | DialogSystem — each character typed | Volume cap 0.7 |
| Correct chime (3 notes up) | QuestionPopup — correct answer | Volume cap 0.7 |
| Wrong buzz (2 notes down) | QuestionPopup — wrong answer | Volume cap 0.7 |
| NPC pop SFX | When TALK indicator appears | Volume cap 0.7 |
| Fireball tick SFX (pitch rises) | Each charge click in Level 5 | Pitch: 1.0 + (charges * 0.05) |
| Fireball whoosh + explosion | Level 5 boss hit | Volume cap 0.7 |

Music should stop cleanly on scene transitions and restart for the new scene. Use `this.sound.stopAll()` in `transitionTo()` before scene start.

---

### M13 — Polish & Final Test

- Browser resize: Phaser `Scale.FIT` handles canvas scaling. Verify at 1280×720 and 1920×1080 viewports
- DOM input repositioning on resize: `this.scale.on('resize', repositionInput, this)`
- Run full testing checklist from spec (`context/final-code-kingdom-prompt.md`, Part 5)
- Review all dialog text against spec for accuracy
- Check all 21 asset filenames resolve correctly in the build
- Verify `npm run build` produces a distributable `/dist` folder

---

## 8. Lesson Content Outlines (Units 1–4)

> **Note:** These outlines provide structure and topic coverage for the lesson screen content. All game-facing curriculum (questions, dialog, NPC lines) comes verbatim from the spec. These lesson texts are summaries that fill in the "ancient scrolls" the player reads. Tone: approachable, encouraging, age 10–14 level. Use the `Press Start 2P` pixel aesthetic in headers.

### Unit 1 — Introduction to Java

**Data key:** `lesson1`
**Triggered by:** Villager 1 (Level 1)

```
Header:  "Unit 1: Introduction to Java"
Header:  "What Is Java?"
Body:    Java is one of the most popular programming languages in the world.
         It powers apps, games, websites, and even space missions.
         When you write Java code, you are giving instructions to a computer —
         step by step, line by line.
Header:  "Your First Line of Code"
Code:    System.out.println("Hello, World!");
Body:    This single line tells Java: print this text to the screen.
         System.out is the "output channel." println means "print this line."
         The text you want to print goes inside double quotes " ".
Callout: 💡 Every Java statement ends with a semicolon ; — just like a period
            ends a sentence. Forget it, and Java will refuse to run!
Header:  "Rules of Java"
Body:    ✦ Java is CASE-SENSITIVE. System is not the same as system.
         ✦ Code runs from TOP to BOTTOM, one line at a time.
         ✦ Every statement ends with a semicolon ;
         ✦ Code blocks are wrapped in curly braces { }
Header:  "Comments"
Code:    // This is a comment — Java ignores this line
         System.out.println("This runs!"); // This runs
Body:    Comments are notes you write for yourself (and other programmers).
         Start a line with // and Java will skip it entirely.
Callout: 🔍 A program that prints "Hello, World!" is the traditional first
            program every programmer writes. You just wrote yours!
```

---

### Unit 2 — Variables & Data Types

**Data key:** `lesson2`
**Triggered by:** Witch (Level 2, on scene load)

```
Header:  "Unit 2: Variables & Data Types"
Header:  "What Is a Variable?"
Body:    A variable is like a magic box with a label on it.
         You can put a value inside, and use it later in your program.
Code:    int score = 10;
         String name = "Code Knight";
         boolean isHero = true;
Body:    The word before the variable name is the DATA TYPE — it tells Java
         what kind of value to expect inside the box.
Header:  "The Four Main Data Types"
Body:    int      → whole numbers: 0, 5, -3, 1000
         double   → decimal numbers: 3.14, 9.99, -0.5
         String   → text (words, sentences): "Hello!" "Code Knight"
         boolean  → true or false — only two possible values
Callout: ⚠️ String starts with a CAPITAL S. All other types are lowercase.
Header:  "Using Variables"
Code:    String hero = "Code Knight";
         System.out.println(hero);
Body:    Notice: when printing a VARIABLE, there are NO quotes around it.
         println(hero) prints the VALUE stored in hero.
         println("hero") prints the WORD hero literally.
Header:  "Arithmetic & the % Operator"
Code:    int a = 9;
         int b = 4;
         System.out.println(a + b);  // 13
         System.out.println(a % b);  // 1 (remainder of 9 ÷ 4)
Body:    + adds   - subtracts   * multiplies   / divides   % gives the REMAINDER
Callout: 💡 The % operator is called MODULUS. 9 % 4 = 1 because 9 ÷ 4 = 2
            remainder 1. Very useful for checking if a number is even or odd!
```

---

### Unit 3 — Conditionals

**Data key:** `lesson3`
**Triggered by:** Owl (Level 3)

```
Header:  "Unit 3: Conditionals"
Header:  "Making Decisions in Code"
Body:    Real programs don't just run the same instructions every time.
         They make DECISIONS based on conditions — just like you do every day.
         "If it is raining, I will bring an umbrella."
Code:    if (isRaining == true) {
             System.out.println("Bring an umbrella!");
         } else {
             System.out.println("Enjoy the sunshine!");
         }
Header:  "The = vs == Trap"
Code:    int x = 5;        // = ASSIGNS the value 5 to x
         if (x == 5) { }   // == ASKS: is x equal to 5?
Callout: ⚠️ Using = inside an if condition is one of the most common bugs
            in Java. Always use == when COMPARING values!
Header:  "Comparison Operators"
Body:    ==   equal to         !=  not equal to
         >    greater than     <   less than
         >=   greater or equal  <= less or equal
Code:    if (score >= 100) {
             System.out.println("You win!");
         }
Header:  "Logical Operators: AND and OR"
Code:    // AND: both conditions must be true
         if (hasKey && doorIsLocked) { ... }

         // OR: at least one condition must be true
         if (isHero || hasSword) { ... }
Body:    && means AND — every condition must be true for the block to run.
         || means OR — only ONE condition needs to be true.
Callout: 💡 || is your friend when you need flexibility.
            && is strict — every condition must pass.
Header:  "else if — Chaining Conditions"
Code:    if (score > 90) {
             System.out.println("Amazing!");
         } else if (score > 60) {
             System.out.println("Good job!");
         } else {
             System.out.println("Keep practicing!");
         }
```

---

### Unit 4 — Loops

**Data key:** `lesson4`
**Triggered by:** Level 4 Mountain (on scene load)

```
Header:  "Unit 4: Loops"
Header:  "Why Do We Need Loops?"
Body:    Imagine you need to print "bridge" 5 times.
         You could write 5 println statements... but what if you needed 1000?
         Loops let you repeat instructions without rewriting them.
Header:  "The while Loop"
Code:    int count = 0;
         while (count < 5) {
             System.out.println("bridge");
             count++;
         }
Body:    The while loop checks its condition BEFORE each repetition.
         If the condition is true, it runs the block. Then checks again.
         count++ means "add 1 to count" — this is how the loop eventually stops.
Callout: ⚠️ If the condition NEVER becomes false, the loop runs forever!
            This is called an INFINITE LOOP — it crashes your program.
            Always make sure your loop has a way to stop!
Header:  "The for Loop"
Code:    for (int i = 0; i < 5; i++) {
             System.out.println("bridge");
         }
Body:    A for loop packs three things into one line:
         int i = 0    → Start: create a counter variable starting at 0
         i < 5        → Condition: keep going while i is less than 5
         i++          → Update: add 1 to i after each loop
Header:  "Tracing a for Loop"
Body:    i=0: 0 < 5? YES → print "bridge" → i becomes 1
         i=1: 1 < 5? YES → print "bridge" → i becomes 2
         i=2: 2 < 5? YES → print "bridge" → i becomes 3
         i=3: 3 < 5? YES → print "bridge" → i becomes 4
         i=4: 4 < 5? YES → print "bridge" → i becomes 5
         i=5: 5 < 5? NO  → loop stops. "bridge" was printed exactly 5 times!
Callout: 💡 for loops are best when you know EXACTLY how many times you want
            to repeat. while loops are best when you are waiting for something
            to change (like player input or a game condition).
```

---

## 9. Java Syntax Validator Design

Lives in `/src/systems/JavaSyntaxValidator.js`. All methods are static (no state). Testable in browser console at any time during development.

### Public API

```js
JavaSyntaxValidator.validate('println', rawInput)
// Returns: { valid: boolean, reason: string }

JavaSyntaxValidator.validate('for_bridge', rawInput)
// Returns: { valid: boolean, reason: string }
```

The `reason` field is for developer debugging only — never shown to the player. The player always sees the question's `wrongFeedback` string.

### Rule: `println` (Village Q1)

**Expected:** `System.out.println("Hello, where can I find the village witch?");`

**Algorithm:**
1. `trim()` the input
2. Collapse external whitespace to single spaces (but NOT inside double-quoted strings)
3. Match structure: `System.out.println` + `(` + `"` + content + `"` + `)` + `;`
4. Extract string content from capture group
5. Compare extracted content exactly against expected string

```js
static validatePrintln(input) {
  const trimmed = input.trim();
  // Structural regex — captures string content in group 1
  const pattern = /^System\.out\.println\s*\(\s*"([^"]*)"\s*\)\s*;$/;
  const match = trimmed.match(pattern);
  if (!match) return { valid: false, reason: 'structural_mismatch' };

  const content = match[1];
  const expected = 'Hello, where can I find the village witch?';
  if (content !== expected) return { valid: false, reason: 'wrong_string_content' };

  return { valid: true, reason: 'correct' };
}
```

**Accepts:** extra spaces around parens/semicolons, any valid spacing
**Rejects:** wrong capitalization, single quotes, missing semicolon, wrong string content, `print` instead of `println`

### Rule: `for_bridge` (Mountain Q2)

**Expected forms:**
- `for (int i = 0; i < 5; i++) { System.out.println("bridge"); }`
- `for (int i = 1; i <= 5; i++) { System.out.println("bridge"); }`
- Any variable name in place of `i`
- Any whitespace variation of the above two

**Algorithm:** Strip ALL whitespace, then match against two structural regex patterns with backreferences.

```js
static validateForLoop(input) {
  const stripped = input.replace(/\s/g, '');

  // 0-based: i=0; i<5; i++
  const pattern0 = /^for\(int([a-zA-Z_]\w*)=0;\1<5;\1\+\+\)\{System\.out\.println\("bridge"\);\}$/;
  // 1-based: i=1; i<=5; i++
  const pattern1 = /^for\(int([a-zA-Z_]\w*)=1;\1<=5;\1\+\+\)\{System\.out\.println\("bridge"\);\}$/;

  if (pattern0.test(stripped) || pattern1.test(stripped)) {
    return { valid: true, reason: 'correct' };
  }
  return { valid: false, reason: 'invalid_for_loop' };
}
```

**Accepts:** any variable name (i, x, count, etc.), any whitespace variation
**Rejects:** `i <= 4`, `i < 6`, capital `Bridge`, single quotes, missing semicolon after println, prefix `++i`, wrong loop range

> **Design decision:** `i <= 4` is NOT accepted, even though mathematically equivalent. The lesson teaches `i < 5` as canonical form. Accepting lookalike variants would undermine the pedagogical goal.

### Full class:

```js
export class JavaSyntaxValidator {
  static validate(ruleId, input) {
    switch (ruleId) {
      case 'println':    return this.validatePrintln(input);
      case 'for_bridge': return this.validateForLoop(input);
      default: throw new Error(`Unknown validator rule: ${ruleId}`);
    }
  }
  static validatePrintln(input) { /* see above */ }
  static validateForLoop(input)  { /* see above */ }
}
```

---

## 10. Testing Checklist (Phase 1)

Complete this before moving to Phase 2.

### Setup
- [ ] `npm run dev` starts Vite without errors in WSL
- [ ] Game renders at 800×450, scales correctly on browser resize
- [ ] Press Start 2P font loads and renders on all text elements
- [ ] All 21 PNG assets load without 404 errors

### Home Screen
- [ ] Village background fills screen
- [ ] "CODE KINGDOM" title renders in yellow with drop shadow
- [ ] Subtitle "A Java Adventure" in white
- [ ] "CLICK ANYWHERE TO START" text pulses
- [ ] Clicking transitions to CutsceneBackstory with fade

### CutsceneBackstory
- [ ] Background shows village with dark overlay
- [ ] All 6 dialog lines display with typewriter effect
- [ ] Clicking mid-type completes text immediately
- [ ] Clicking on complete text advances to next line
- [ ] After line 6: 1-second pause then fade to Level 1

### Level 1 — Village
- [ ] Player spawns on left side, all 4 NPCs visible at correct positions
- [ ] Player moves left/right, jump works, sprite flips direction correctly
- [ ] Walk animation alternates 1.png/2.png every 200ms when moving
- [ ] Camera follows player smoothly, clamped to world bounds (3000px)
- [ ] TALK indicator appears within 80px of each NPC, disappears outside range
- [ ] Villager 1: dialog opens, Lesson 1 triggers, post-lesson dialog plays
- [ ] Lesson 1: scrollable, CONTINUE unlocks after 4s or near-bottom scroll
- [ ] Player movement locked while dialog/lesson/question is open
- [ ] Villager 2: dialog → Q1 text input appears
- [ ] Q1 wrong answer: box shakes, red feedback, player must keep trying
- [ ] Q1 correct answer: green feedback, V2 post-Q1 dialog, `talkedToVillager2` set
- [ ] Villager 3: locked before V2 sequence complete — lock text floats above player
- [ ] Villager 3 unlocks after V2 sequence, Q2 multiple choice works
- [ ] Villager 4: locked before V3 sequence complete, Q3 multiple choice works
- [ ] After V4 Q3 correct: dialog then fade transition to Level 2

### Level 2 — Cauldron
- [ ] Lesson 2 opens automatically on scene load
- [ ] Witch post-lesson dialog plays after lesson
- [ ] Cauldron Q1 triggers, correct answer plays ingredient animation
- [ ] Cauldron tint changes on each ingredient: green → purple → gold
- [ ] All 3 cauldron questions trigger in sequence
- [ ] Witch final dialog plays after Q3 correct
- [ ] Scene transitions correctly (to placeholder or Level 3 stub)

### JavaSyntaxValidator (test in browser console)
- [ ] `JavaSyntaxValidator.validate('println', 'System.out.println("Hello, where can I find the village witch?");')` → `{ valid: true }`
- [ ] `JavaSyntaxValidator.validate('println', 'system.out.println("Hello, where can I find the village witch?");')` → `{ valid: false }` (lowercase system)
- [ ] `JavaSyntaxValidator.validate('println', 'System.out.println("Hello, where can I find the village witch?")')` → `{ valid: false }` (missing semicolon)
- [ ] `JavaSyntaxValidator.validate('for_bridge', 'for (int i = 0; i < 5; i++) { System.out.println("bridge"); }')` → `{ valid: true }`
- [ ] `JavaSyntaxValidator.validate('for_bridge', 'for(inti=0;i<5;i++){System.out.println("bridge");}')` → `{ valid: true }` (no spaces)
- [ ] `JavaSyntaxValidator.validate('for_bridge', 'for (int x = 1; x <= 5; x++) { System.out.println("bridge"); }')` → `{ valid: true }` (1-based, different var)
- [ ] `JavaSyntaxValidator.validate('for_bridge', 'for (int i = 0; i <= 4; i++) { System.out.println("bridge"); }')` → `{ valid: false }` (i<=4 not accepted)

---

## 11. XP Workflow & Pair Programming Notes

### Setup for Two Developers on One Machine
- Install the **Live Share** extension — even on one machine, it gives both devs their own cursor and follow mode for reviewing code together
- Use **Peacock** to color-code the VSCode window so you can quickly identify which workspace is open at a glance
- Establish a regular driver/navigator rotation (e.g., switch every 20–30 minutes, or at each task boundary)
- Run `npm run dev` in an integrated VSCode terminal — both devs can see the hot-reload in the browser side by side

### Git Workflow
- Commit at the end of each task — not milestone, task. Small, frequent commits give you a clear undo history during pairing
- Use descriptive commit messages: `feat: DialogSystem typewriter effect + click guard` not `update dialog`
- Even for a two-person solo project, create a branch per milestone and merge when the milestone's checklist is green

### Build Order (Optimized for Pairing)

The tasks below are ordered to minimize blocking — earlier tasks unlock parallel tracks for the pair:

| Order | Task | Reason |
|---|---|---|
| 1 | Project scaffold + all scene stubs | Unblocks scene navigation testing immediately |
| 2 | `gameState.js` | Needed by everything — 10 minutes, do it first |
| 3 | `sceneHelpers.js` (transitionTo + floatingText) | Used by all levels |
| 4 | `JavaSyntaxValidator.js` | Self-contained, testable immediately in console |
| 5 | `DialogSystem.js` | Highest dependency — blocks all NPC content |
| 6 | `QuestionPopup.js` | Depends on Dialog patterns; can be done in parallel once Dialog is stable |
| 7 | `LessonScreen.js` | Independent from Dialog and Question — good parallel track |
| 8 | Player movement system (in Level1) | Core gameplay loop |
| 9 | Level 1 — Village full NPC chain | Integration milestone |
| 10 | Level 2 — Cauldron | Reuses all systems from step 9 |
| 11 | HomeScreen + CutsceneBackstory | Cosmetically last; all systems proven by now |

### Known Pitfalls to Avoid

1. **Event listener leak**: Always pair `game.events.on()` in `create()` with `game.events.off()` in `shutdown()`. Missing this causes dialog callbacks to fire multiple times on scene restart.
2. **Parallel scenes not stopped on transition**: Always use the `transitionTo()` helper — it stops DialogSystem, QuestionPopup, and LessonScreen before `scene.start()`.
3. **`talkedToVillager2` set too early**: Must be set only after V2 post-Q1 dialog `DIALOG_CLOSED` fires — not on question correct, not on first V2 dialog.
4. **Click-through between dialog and question**: The 100ms click guard in DialogSystem must also be implemented in QuestionPopup, otherwise the click that dismisses dialog accidentally triggers a multiple-choice button.
5. **DOM `<input>` layer issues**: The HTML input element floats above the canvas. Set `pointer-events: none` on the Phaser canvas wrapper during normal gameplay; re-enable during QuestionPopup.
6. **Mountain Q2 barrier**: `bridgeBuilt` must be set (and barrier removed) for BOTH the correct answer path AND the 3-strikes reveal path. Handle both in the `QUESTION_CLOSED` listener.

---

*Built with Phaser 3 + Vite · Extreme Programming · Code Kingdom © 2026*
