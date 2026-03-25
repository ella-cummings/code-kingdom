# Code Kingdom

An educational RPG that teaches Java programming fundamentals through an adventure game. Built with **Phaser 3.60** and **Vite**.

---

## About

Players take on the role of a Code Knight tasked with saving the Code Kingdom from the evil Bug Dragon — who has corrupted the land with broken syntax. Progress through five levels, each teaching a core Java concept, then defeat the dragon and restore the kingdom.

---

## Gameplay

- Side-scrolling pixel-art RPG
- Walk up to NPCs and signs, press **E** to interact
- Answer multiple-choice and code-writing questions to progress
- Lessons appear before each topic is tested
- Three-strikes system on hard questions — answer or have the solution revealed with explanation

---

## Levels

| Level | Setting | Java Topic |
|-------|---------|------------|
| 1 — The Village | Village | `System.out.println` / IDE setup |
| 2 — The Cauldron | Witch's hut | Variables & data types |
| 3 — The Forest | Enchanted forest | Conditionals (`if` / `else` / `&&`) |
| 4 — Loop Mountain | Mountain chasm | Loops (`while` / `for`) |
| 5 — The Dragon's Lair | Castle | Boss battle (charge mechanic) |

---

## Tech Stack

- **Phaser 3.60** — game framework
- **Vite** — build tool / dev server
- **Vanilla JavaScript (ES Modules)**
- Pixel art assets (static sprites)
- Custom dialog, lesson, and question overlay system

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── main.js               # Phaser game config + scene registry
├── gameState.js          # Global state singleton
├── scenes/
│   ├── HomeScreen.js
│   ├── CutsceneBackstory.js
│   ├── Level1_Village.js
│   ├── Level2_Cauldron.js
│   ├── Level3_Forest.js
│   ├── Level4_Mountain.js
│   ├── Level5_Castle.js
│   └── EndScreen.js
├── data/
│   ├── dialogData.js     # All NPC / narrator dialog lines
│   ├── questionData.js   # All quiz questions
│   └── lessonData.js     # Lesson screen content
└── utils/
    ├── sceneHelpers.js   # transitionTo(), shared utilities
    └── JavaSyntaxValidator.js  # Validates typed code answers
```

---

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Space / W / Up | Jump |
| E | Interact with NPCs / signs / objects |

---
