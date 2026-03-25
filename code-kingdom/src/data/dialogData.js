// ─── Backstory (CutsceneBackstory) ────────────────────────────────────────────
export const BACKSTORY_LINES = [
  {
    speaker: 'Narrator',
    portrait: null,
    text: 'Long ago, the Code Kingdom was a place of wonder and order — powered by ancient streams of magical Java code that flowed through every building, every tree, and every living creature.',
  },
  {
    speaker: 'Narrator',
    portrait: null,
    text: 'The code kept everything running perfectly. The sun rose on time. The rivers flowed in clean loops. The villagers lived in peaceful, well-organized programs.',
  },
  {
    speaker: 'Narrator',
    portrait: null,
    text: 'But one dark night, the evil Bug Dragon descended from the corrupted mountains. With one mighty roar, he breathed streams of broken syntax across the land — crashing programs, tangling logic, and filling every line of code with errors.',
  },
  {
    speaker: 'Narrator',
    portrait: null,
    text: 'Now the kingdom is falling apart. Variables are undefined. Loops run forever. Nothing works the way it should.',
  },
  {
    speaker: 'Narrator',
    portrait: null,
    text: 'But the ancient scrolls spoke of a chosen one — a young Code Knight who would rise from the village, learn the sacred arts of Java, and defeat the Bug Dragon before he turns every last soul in the kingdom into 1s and 0s.',
  },
  {
    speaker: 'Narrator',
    portrait: null,
    text: 'That Code Knight... is YOU.',
  },
];

// ─── Level 1 — Villager 1 ─────────────────────────────────────────────────────
export const VILLAGER1_GREETING = [
  {
    speaker: 'Villager 1',
    portrait: 'villager1',
    text: "Hey there, young one! You look like a newcomer to our village. I can tell just by looking at you — you've got the spark of a true Code Knight!",
  },
  {
    speaker: 'Villager 1',
    portrait: 'villager1',
    text: 'But before you go running off on any grand adventures, let me share some wisdom with you. Every great Code Knight starts by learning the basics. Here — read this ancient scroll carefully.',
  },
];

export const VILLAGER1_POST_LESSON = [
  {
    speaker: 'Villager 1',
    portrait: 'villager1',
    text: "You're already picking this up faster than I expected! I've seen hundreds of young folk come through this village... but there's something different about you. I think you might just be the one the old scrolls talk about.",
  },
  {
    speaker: 'Villager 1',
    portrait: 'villager1',
    text: "The Bug Dragon has corrupted the land, and the Kingdom needs a hero who understands the language of code. I believe that hero is YOU.",
  },
  {
    speaker: 'Villager 1',
    portrait: 'villager1',
    text: "But listen — you can't face a Bug Dragon alone. You're going to need magical powers, and for that... you need the Village Witch. She lives on the far side of town. Go ask around — someone in this village will know where to find her!",
  },
];

// ─── Level 1 — Villager 2 ─────────────────────────────────────────────────────
export const VILLAGER2_PRE_Q1 = [
  {
    speaker: 'Villager 2',
    portrait: 'villager2',
    text: "Oh! You're looking for the witch? Hmm, I'm not sure exactly where she is today... she moves around a lot, you know. Always brewing something.",
  },
  {
    speaker: 'Villager 2',
    portrait: 'villager2',
    text: "If anyone knows, it's probably Old Barnaby — the boy with the cow. The witch is his grandmother! Try talking to him.",
  },
  {
    speaker: 'Villager 2',
    portrait: 'villager2',
    text: 'Oh — but first, let me see if you paid attention to that scroll. Answer me this:',
  },
];

export const VILLAGER2_POST_Q1 = [
  {
    speaker: 'Villager 2',
    portrait: 'villager2',
    text: 'Ha! Look at you go! Barnaby is just up ahead. Good luck, Code Knight!',
  },
];

// ─── Level 1 — Villager 3 ─────────────────────────────────────────────────────
export const VILLAGER3_PRE_Q2 = [
  {
    speaker: 'Villager 3',
    portrait: 'villager3',
    text: "You're looking for my grandma? She's the best witch in the whole kingdom! But she's a tricky one — she told me to only send worthy visitors her way.",
  },
  {
    speaker: 'Villager 3',
    portrait: 'villager3',
    text: "Answer my question, and I'll point you in the right direction!",
  },
];

export const VILLAGER3_POST_Q2 = [
  {
    speaker: 'Villager 3',
    portrait: 'villager3',
    text: "Nice! You really do know your stuff. Grandma is just ahead — she's the one with the big pointy hat standing next to the bubbling cauldron. You can't miss her!",
  },
];

// ─── Level 1 — Villager 4 (Witch) ────────────────────────────────────────────
export const VILLAGER4_PRE_Q3 = [
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "So... they sent you to me, did they? I've heard whispers about you, young one. The villagers say a Code Knight has arrived who might be able to save us from the Bug Dragon.",
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "I've been waiting for someone like you. But I've been fooled before by pretenders who didn't know their code from their comments. So before I help you — prove yourself.",
  },
];

export const VILLAGER4_POST_Q3 = [
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "Well I'll be a pickled toad... you really DO know your Java! The scrolls were right about you after all.",
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "You're going to need more than just knowledge to face the Bug Dragon. You'll need power — real magical power. And lucky for you, that's exactly what I do.",
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "Come! Let's brew you a potion. Follow me to my cauldron!",
  },
];

// ─── Level 3 — Conditional Forest (Owl) ───────────────────────────────────────
export const OWL_INTRO = [
  { speaker: 'Wise Owl', portrait: 'owl', text: "Hoo hoo! So the witch sent you, did she? Welcome to the Conditional Forest, young Code Knight. Not everyone makes it through..." },
  { speaker: 'Wise Owl', portrait: 'owl', text: "This forest runs on if/else logic. Every fork in the path asks a question. Answer right and the path opens. Answer wrong... well. Let's just say, answer right." },
  { speaker: 'Wise Owl', portrait: 'owl', text: "I'll be watching from above. Here — study this scroll before you take another step." },
];

export const OWL_Q1_TO_Q2 = [
  { speaker: 'Wise Owl', portrait: 'owl', text: "The first fork is clear! The path bends east. Quick now — the second sign is just ahead." },
];

export const OWL_Q2_TO_Q3 = [
  { speaker: 'Wise Owl', portrait: 'owl', text: "Splendid! The forest is responding to you. One more challenge and the exit will reveal itself." },
];

export const OWL_FINAL = [
  { speaker: 'Wise Owl', portrait: 'owl', text: "You've done it! The Conditional Forest bows to your logic. Not even seasoned knights make it through this quickly." },
  { speaker: 'Wise Owl', portrait: 'owl', text: "But ahead lies Loop Mountain — and that place requires a different kind of thinking entirely. Find the old Stonecutter at the base of the mountain. He'll explain." },
  { speaker: 'Wise Owl', portrait: 'owl', text: "Fly true, Code Knight. The Kingdom needs you." },
];

// ─── Level 4 — Loop Mountain ──────────────────────────────────────────────────
export const BRIDGE_NARRATIVE = [
  { speaker: 'Narrator', portrait: null, text: 'Brave programmer! To build the bridge and cross the chasm, you must write a loop that prints the word "bridge" exactly 5 times. This will lay each plank of the crossing, one by one. Prove your skill!' },
];

// ─── Level 4 — Loop Mountain (Stonecutter) ────────────────────────────────────
export const STONECUTTER_INTRO = [
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "You made it through the forest! I wasn't sure anyone would come this season." },
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "See that chasm? The Bug Dragon destroyed our bridge. We've been stuck here ever since. But legend says a Code Knight can REBUILD it — using the power of loops." },
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "Each correct answer you give places one magical stone. Three stones build the bridge. But you'll need to study first." },
];

export const STONECUTTER_Q1_TO_Q2 = [
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "One stone laid! The bridge is taking shape. Two more to go." },
];

export const STONECUTTER_Q2_TO_Q3 = [
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "Two stones! I can almost see it! One final question — the keystone!" },
];

export const STONECUTTER_BRIDGE_BUILT = [
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "The bridge is BUILT! By the ancient syntax, I've never seen anything like it!" },
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "Cross quickly. The Dragon's Lair is just beyond the peak. And word is... the Bug Dragon knows you're coming." },
  { speaker: 'Stonecutter', portrait: 'stonecutter', text: "Go! And may your code be bug-free!" },
];

// ─── End Screen — Mentor Sendoff ──────────────────────────────────────────
export const MENTOR_SENDOFF = [
  { speaker: 'Narrator', portrait: null, text: "You did it, young programmer. You really, truly did it. But here's the secret that every great developer eventually learns: the real adventure isn't defeating dragons. It's what you BUILD after the battle is over." },
  { speaker: 'Narrator', portrait: null, text: "Everything you learned on this quest — printing to the screen, declaring variables, making decisions with if/else, repeating actions with loops — these are the same tools that real Java developers use every day to build apps, games, websites, and systems used by millions of people." },
  { speaker: 'Narrator', portrait: null, text: "You set up your IDE back in Level 1. It's still there, waiting for you. Now it's time to use it — not to answer questions, but to CREATE something of your own." },
  { speaker: 'Narrator', portrait: null, text: "Go forth, Code Knight. The kingdom may be saved — but your story as a programmer is just beginning. 🚀" },
];

// ─── Level 5 — Dragon's Lair ──────────────────────────────────────────────────
export const DRAGON_INTRO = [
  { speaker: 'Bug Dragon', portrait: 'dragon', text: "HRRAAAAK! So you are the one they call the Code Knight... I've corrupted entire LANGUAGES and you think you can stop me?!" },
  { speaker: 'Bug Dragon', portrait: 'dragon', text: "Your Java is no match for my NullPointerException breath! Prepare yourself!" },
];

export const DRAGON_HIT1 = [
  { speaker: 'Bug Dragon', portrait: 'dragon', text: "GAH! A hit! Impossible... but this fight is FAR from over!" },
];

export const DRAGON_HIT2 = [
  { speaker: 'Bug Dragon', portrait: 'dragon', text: "NOOOO! My syntax shields are failing! This cannot be... I am the greatest bug in the kingdom!" },
];

export const DRAGON_DEFEATED = [
  { speaker: 'Bug Dragon', portrait: 'dragon', text: "I... I have been... compiled out of existence... Impossible... How does a child know Java this well?!" },
  { speaker: 'Narrator', portrait: null, text: "With a final blast of pure, error-free code, the Bug Dragon explodes into a shower of semicolons and closing braces." },
  { speaker: 'Narrator', portrait: null, text: "Across the kingdom, corrupted code begins to heal. Variables find their values. Loops reach their end conditions. Programs run clean and true once more." },
  { speaker: 'Narrator', portrait: null, text: "And in the village, the villagers cheer — because the Code Knight has done what the ancient scrolls foretold." },
  { speaker: 'Narrator', portrait: null, text: "The Code Kingdom is saved." },
];

// ─── Level 2 — Witch / Cauldron ───────────────────────────────────────────────
export const WITCH_POST_LESSON = [
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'Now that you understand the building blocks of Java — variables, data types, and all that — it\'s time to brew your power potion!',
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'This is no ordinary recipe. Each ingredient must be summoned with the correct answer. The magic only responds to truth — so think carefully before you speak!',
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'First ingredient: the Moonpetal Flower. It only blooms for those who know their data types.',
  },
];

export const WITCH_Q1_TO_Q2 = [
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "Yes! The Moonpetal answers! Now — the second ingredient: a Rabbit's Ear...",
  },
];

export const WITCH_Q2_TO_Q3 = [
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'Wonderful! And for the final ingredient — the Golden Star Dust!',
  },
];

export const WITCH_FINAL = [
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'Double, double, cauldron bubble — fire burn and code compile! May these powers be granted to our brave Code Knight: the fire of fireballs, the swiftness of super speed, and the spring of super jumps — for the long journey ahead!',
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: "The potion is complete. Drink up, young warrior. You're going to need every drop of it.",
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'Now go — head north through the Conditional Forest. An old friend of mine, a wise owl, will meet you at the entrance. She knows those woods better than anyone. Follow the signs, answer what they ask, and you\'ll find your way through.',
  },
  {
    speaker: 'The Witch',
    portrait: 'villager4',
    text: 'Good luck, Code Knight. The Kingdom is counting on you.',
  },
];
