  
**⚔️  CODE KINGDOM**

**Full Game Development Prompt**

A 2D Side-Scrolling P Educational RPG

Complete specification for AI-assisted development

**PART 1 — GAME OVERVIEW & ASSET REFERENCE**

**Overview**

Build a 2D side-scrolling educational game called Code Kingdom using HTML5 Canvas \+ JavaScript (or Phaser.js — recommended for easier sprite, input, and scene management). The game teaches Java programming to kids ages 10–14 through an interactive RPG adventure. The visual style is retro pixel art, inspired by classic Mario and Terraria — chunky pixels, bright colors, and a nostalgic feel.

All assets are provided as PNG files. Do not generate or substitute any graphics — use only the provided assets listed below. (only generate graphics if needed)

**Technical Specs**

* Engine/Language: Phaser 3 (preferred) OR vanilla HTML5 Canvas \+ JavaScript

* Resolution: 800×450px (16:9, scalable to fill browser window)

* Font Style: Import "Press Start 2P" from Google Fonts for ALL text — every dialog box, button, UI label, and popup in the game

**Controls:**

* Move Right: D or Right Arrow

* Move Left: A or Left Arrow

* Jump: W or Up Arrow

* Interact/Select: Left Mouse Click

Movement Style: The player walks left and right across a horizontally scrolling world. The camera follows the player smoothly. Jumping is available but there are no complex platforming sections — the ground is flat in all levels.

**Asset Reference Table**

All assets are PNG files with transparent backgrounds (except backgrounds). Reference them by filename exactly as listed:

| File | Label | Used In |
| :---- | :---- | :---- |
| 1.png | Player (idle sprite) | All levels |
| 2.png | Player (walk sprite) | All levels — alternate with idle when moving |
| 3.png | Villager 1 — large bearded man | Level 1 (Village) |
| 4.png | Log | Level 3 (Forest) — landmark near Sign 2 |
| 5.png | Villager 3 — boy with cow | Level 1 (Village) |
| 6.png | Rock | Level 3 (Forest) — landmark near Sign 1 |
| 7.png | Chest | Level 4 (Mountain) |
| 8.png | Villager 4 — witch (grandma) | Level 1 (Village) |
| 9.png | Cauldron | Level 2 (Cauldron Scene) |
| 10.png | Owl | Level 3 (Forest) |
| 11.png | Sign (wooden post sign) | Level 3 (Forest) — 3 signs total |
| 12.png | Pile (stone slabs) | Level 4 (Mountain) — replaces chest after Q1 |
| 13.png | Fireball | Level 5 (Castle) — boss battle projectile |
| 14.png | Bug Dragon (alive) | Level 5 (Castle) |
| 15.png | Dead Bug Dragon (explosion) | Level 5 (Castle) — replaces bug dragon after defeat |
| 16.png | Villager 2 — kid in overalls | Level 1 (Village) |
| 17.png | Village background | Home Screen \+ Level 1 |
| 18.png | Forest background | Level 3 |
| 19.png | Mountain background | Level 4 |
| 20.png | Bridge background | Level 4 transition |
| 21.png | Castle interior background | Level 5 |

| 💡 Player Animation Alternate between 1.png (idle) and 2.png (walk) using a simple frame timer. Show 1.png when standing still. Cycle between 1.png and 2.png every 200ms when moving. Flip the sprite horizontally when the player walks left. |
| :---- |

**Game Architecture — Scene List**

Structure the game using the following ordered scenes. Each should be a self-contained Phaser Scene:

* HomeScreen

* CutsceneBackstory

* Level1\_Village  ← main exploration level

* LessonScreen  (reusable — pass lesson content as data)

* QuestionPopup  (reusable — pass question data, answers, correct answer)

* Level2\_Cauldron

* Level3\_Forest

* Level4\_Mountain

* Level5\_Castle

* EndScreen

**PART 2 — REUSABLE SYSTEMS**

**Dialog Box System**

* A dark semi-transparent rounded rectangle at the bottom of the screen (full width, \~25% screen height)

* Character portrait on the left (the sprite of whoever is speaking, scaled to fit)

* Character name in yellow pixel font above the dialog text

* Dialog text typed out one character at a time (typewriter effect, \~40ms per character)

* A small blinking ▼ arrow in the bottom-right corner — clicking anywhere advances to the next line

* Clicking before text finishes typing skips to showing the full text immediately

* Support multi-line dialog sequences passed as an array of strings

* On close: emit global event DIALOG\_CLOSED and resume player movement

**Question Popup System**

Build a reusable QuestionPopup scene/overlay. It accepts the following data object:

| {   question: 'string',   type: 'text\_input' | 'multiple\_choice',   choices: \['A) ...', 'B) ...', 'C) ...'\],  // only for multiple\_choice   correctAnswer: 'string or index',   wrongFeedback: 'string shown on wrong answer',   correctFeedback: 'string shown on correct answer' } |
| :---- |

* Display a parchment-style box in the center of the screen

* For multiple\_choice: show 3 clickable buttons labeled A, B, C

* For text\_input: show a text input field the player can type into

* Wrong answer: shake the box, flash border red, show wrongFeedback — player must keep trying

* Correct answer: flash border green, show correctFeedback, then close

* SPECIAL RULE — Mountain Q2: if the player gets it wrong 3 times in a row, reveal the correct answer with explanation and allow them to proceed

**Lesson Screen**

A scrollable full-screen overlay displaying formatted lesson content. Rules:

* Section headers in yellow, body text in white, code blocks in a darker box with monospace/green text

* Callout boxes (💡 ⚠️ 🔍 etc.) in tinted background boxes with gold border

* CONTINUE → button at bottom — disabled for first 4 seconds OR until player scrolls near the bottom

* On close: emit LESSON\_CLOSED and mark gameState lesson flag as viewed

**PART 3 — SCENE-BY-SCENE BREAKDOWN**

**Scene 1 — Home Screen**

* Background: 17.png (village bg), scaled to fill screen

* Large title text: "CODE KINGDOM" in bright yellow pixel font with dark drop shadow

* Subtitle: "A Java Adventure" in white

* Pulsing text (scale in and out): "CLICK ANYWHERE TO START"

* Ambient animation: clouds drift slowly across the sky portion of the background

* On click: transition to CutsceneBackstory

**Scene 2 — Cutscene: Backstory**

Background: 17.png slightly darkened with a dark overlay. Use the Dialog Box system to show the following story, one page at a time (player clicks to advance):

| Dialog Line 1 "Long ago, the Code Kingdom was a place of wonder and order — powered by ancient streams  of magical Java code that flowed through every building, every tree, and every living creature." |
| :---- |

| Dialog Line 2 "The code kept everything running perfectly. The sun rose on time. The rivers flowed in clean  loops. The villagers lived in peaceful, well-organized programs." |
| :---- |

| Dialog Line 3 "But one dark night, the evil Bug Dragon descended from the corrupted mountains. With one  mighty roar, he breathed streams of broken syntax across the land — crashing programs,  tangling logic, and filling every line of code with errors." |
| :---- |

| Dialog Line 4 "Now the kingdom is falling apart. Variables are undefined. Loops run forever.  Nothing works the way it should." |
| :---- |

| Dialog Line 5 "But the ancient scrolls spoke of a chosen one — a young Code Knight who would rise from  the village, learn the sacred arts of Java, and defeat the Bug Dragon before he turns  every last soul in the kingdom into 1s and 0s." |
| :---- |

| Dialog Line 6 (dramatic pause after) "That Code Knight... is YOU." |
| :---- |

After the final line: 1-second pause, then transition to Level1\_Village.

**Scene 3 — Level 1: The Village**

* Background: 17.png — wide horizontal scrolling level (\~3000–4000px world width)

* Ground: flat platform. All characters stand on this ground.

* Characters placed left-to-right: Villager 1 (x=300), Villager 2 (x=900), Villager 3 (x=1600), Villager 4 \+ Cauldron (x=2300/2500)

* NPC Interaction: when player is within \~80px, a floating \[TALK\] speech bubble bobs above the NPC

* Clicking an NPC while within range opens their dialog

**Villager 1 — Greeting \+ Unit 1 Lesson**

| Villager 1 Dialog (before lesson) "Hey there, young one\! You look like a newcomer to our village. I can tell just by looking  at you — you've got the spark of a true Code Knight\!" "But before you go running off on any grand adventures, let me share some wisdom with you.  Every great Code Knight starts by learning the basics. Here — read this ancient scroll carefully." |
| :---- |

**→ TRIGGER: Open LessonScreen with Unit 1 content.**

| Villager 1 Dialog (after lesson) "You're already picking this up faster than I expected\! I've seen hundreds of young folk come  through this village... but there's something different about you. I think you might just  be the one the old scrolls talk about." "The Bug Dragon has corrupted the land, and the Kingdom needs a hero who understands the  language of code. I believe that hero is YOU." "But listen — you can't face a Bug Dragon alone. You're going to need magical powers, and  for that... you need the Village Witch. She lives on the far side of town. Go ask around  — someone in this village will know where to find her\!" |
| :---- |

**Villager 2 — Q1**

| Villager 2 Dialog "Oh\! You're looking for the witch? Hmm, I'm not sure exactly where she is today...  she moves around a lot, you know. Always brewing something." "If anyone knows, it's probably Old Barnaby — the boy with the cow. The witch is his  grandmother\! Try talking to him." "Oh — but first, let me see if you paid attention to that scroll. Answer me this:" |
| :---- |

| Q1 — Text Input Question: How do you print the text "Hello, where can I find the village witch?" in Java using one println statement? Type: text\_input Correct Answer: System.out.println("Hello, where can I find the village witch?"); Wrong Feedback: Not quite\! Remember: System.out.println() prints text. The text goes inside double quotes, inside the parentheses. Don't forget the semicolon at the end\! Correct Feedback: That's right\! You're speaking Java already\! |
| :---- |

| Villager 2 Dialog (after correct) "Ha\! Look at you go\! Barnaby is just up ahead. Good luck, Code Knight\!" |
| :---- |

**Villager 3 — Q2 (boy with cow, 5.png)**

| Villager 3 Dialog "You're looking for my grandma? She's the best witch in the whole kingdom\!  But she's a tricky one — she told me to only send worthy visitors her way." "Answer my question, and I'll point you in the right direction\!" |
| :---- |

| Q2 — Multiple Choice Question: What punctuation mark must you put at the end of every Java statement for it to run? A) Comma , B) Semicolon ; C) Period . Correct Answer: B Wrong Feedback: Not quite\! Think about how sentences end... but in Java style. Correct Feedback: Yes\! Every Java statement ends with a semicolon ; — just like a period ends a sentence\! |
| :---- |

| Villager 3 Dialog (after correct) "Nice\! You really do know your stuff. Grandma is just ahead — she's the one with  the big pointy hat standing next to the bubbling cauldron. You can't miss her\!" |
| :---- |

**Villager 4 (The Witch) — Q3**

| Villager 4 Dialog "So... they sent you to me, did they? I've heard whispers about you, young one.  The villagers say a Code Knight has arrived who might be able to save us from the Bug Dragon." "I've been waiting for someone like you. But I've been fooled before by pretenders who  didn't know their code from their comments. So before I help you — prove yourself." |
| :---- |

| Q3 — Multiple Choice Question: Java reads code from top to bottom. True or False? A) True B) False C) It depends on the program Correct Answer: A Wrong Feedback: Not quite\! Think about how you read a book — left to right, top to bottom. Java works the same way\! Correct Feedback: Correct\! Java always reads from top to bottom, line by line\! |
| :---- |

| Villager 4 Dialog (after correct) "Well I'll be a pickled toad... you really DO know your Java\!  The scrolls were right about you after all." "You're going to need more than just knowledge to face the Bug Dragon.  You'll need power — real magical power. And lucky for you, that's exactly what I do." "Come\! Let's brew you a potion. Follow me to my cauldron\!" |
| :---- |

**→ TRIGGER: Transition to Level2\_Cauldron**

**Scene 4 — Level 2: The Cauldron**

* Background: 17.png (village bg, cauldron 9.png prominent center/right)

* Characters: Villager 4 / Witch (8.png) left of cauldron, player on the right

* On scene load: immediately open LessonScreen with Unit 2 content

| Witch Dialog (after lesson) "Now that you understand the building blocks of Java — variables, data types, and all that  — it's time to brew your power potion\!" "This is no ordinary recipe. Each ingredient must be summoned with the correct answer.  The magic only responds to truth — so think carefully before you speak\!" "First ingredient: the Moonpetal Flower. It only blooms for those who know their data types." |
| :---- |

**Cauldron Q1 — Flower Ingredient**

| Q1 — Multiple Choice Question: What data type would you use to store someone's name in Java? A) int B) boolean C) String Correct Answer: C Wrong Feedback: Not quite\! A name is made of letters and words — which data type handles text? Correct Feedback: Correct\! String is used to store text like names, sentences, and words\! |
| :---- |

→ On correct: sparkle animation — flower icon floats into cauldron, cauldron bubbles green.

Witch says: "Yes\! The Moonpetal answers\! Now — the second ingredient: a Rabbit's Ear..."

**Cauldron Q2 — Rabbit Ear Ingredient**

| Q2 — Multiple Choice Question: What is the result of 9 % 4 in Java? A) 2 B) 1 C) 3 Correct Answer: B Wrong Feedback: Remember: % is the modulus operator\! It gives you the REMAINDER after division. 9 ÷ 4 \= 2 remainder... what? Correct Feedback: Yes\! 9 divided by 4 is 2 with a remainder of 1\. The modulus gives you that remainder\! |
| :---- |

→ On correct: rabbit ear floats into cauldron, cauldron turns purple.

Witch says: "Wonderful\! And for the final ingredient — the Golden Star Dust\!"

**Cauldron Q3 — Gold Dust Ingredient**

| Q3 — Multiple Choice Question: What is wrong with this code?   System.out.println("name"); (Assume 'name' is a variable, not the word you want to print.) A) The variable name should not have quotes around it B) println should be capitalized C) There is a missing semicolon Correct Answer: A Wrong Feedback: Look closely at the quotes\! When you put quotes around something in println, Java treats it as literal text — not as a variable\! Correct Feedback: Exactly right\! Writing println("name") prints the word 'name' literally. To print the VARIABLE called name, write println(name) — no quotes\! |
| :---- |

→ On correct: gold star dust rains into cauldron, cauldron glows bright gold.

| Witch Final Dialog (Potion Complete) "Double, double, cauldron bubble — fire burn and code compile\! May these powers be granted  to our brave Code Knight: the fire of fireballs, the swiftness of super speed, and the  spring of super jumps — for the long journey ahead\!" "The potion is complete. Drink up, young warrior. You're going to need every drop of it." "Now go — head north through the Conditional Forest. An old friend of mine, a wise owl,  will meet you at the entrance. She knows those woods better than anyone. Follow the signs,  answer what they ask, and you'll find your way through." "Good luck, Code Knight. The Kingdom is counting on you." |
| :---- |

**→ TRIGGER: Transition to Level3\_Forest**

**Scene 5 — Level 3: The Conditional Forest**

* Background: 18.png (forest bg) — wide scrolling horizontal level

* On scene load: Owl (10.png) appears at left side of screen

* Place three sign sprites (11.png) at increasing x positions along the level

* Place rock (6.png) near Sign 2, log (4.png) near Sign 3

| Owl Dialog (opening) "Hoo hoo\! Welcome, young Code Knight, to the Conditional Forest\! I am Sylvia — guardian  of these ancient woods, and keeper of the coded paths." "This forest is alive with logic. Every path through it is governed by conditions — if this,  then that. The trees themselves only let you pass if you think clearly\!" "Before you venture in alone, let me share the wisdom of conditionals with you." |
| :---- |

**→ TRIGGER: Open LessonScreen with Unit 3 content.**

| Owl Dialog (after lesson) "Good\! There are three magical signs planted along the forest path. Each one holds a direction  that will guide you to the next sign — and eventually, out of the forest entirely." "But the directions on each sign are hidden. To reveal them, you must answer the sign's  question correctly. Only truth unlocks the path." "The first sign is right here. Go on — click on it when you're ready\!" |
| :---- |

**Sign 1**

| Q1 — Multiple Choice Question: What does the \== operator do in Java, and how is it different from \= ? A) \== assigns a value; \= compares two values B) \== compares two values to check if they are equal; \= assigns a value to a variable C) They do the same thing — both check if two things are equal Correct Answer: B Wrong Feedback: Think about it: int x \= 5 is STORING the number 5 in x. But if (x \== 5\) is ASKING the question 'is x equal to 5?' — two very different things\! Correct Feedback: Exactly\! \= stores a value. \== asks a question. Never mix them up in an if statement\! |
| :---- |

→ On correct: sign text revealed → "HEAD TO THE BIG ROCK" — rock sparkles in the distance.

**Sign 2 (near the rock)**

| Q2 — Multiple Choice Question: If x \= 3 and y \= 7, what does this print?     if (x \> 5 || y \> 5\) { System.out.println("Yes\!"); } A) Nothing — both conditions are false B) Yes\! C) An error — you can't use || with numbers Correct Answer: B Wrong Feedback: Remember OR (||): only ONE condition needs to be true\! Is x \> 5? No. Is y \> 5? Yes\! Since at least one is true, the whole condition is true. Correct Feedback: Correct\! With OR (||), only one side needs to be true. y \= 7 which IS greater than 5, so Yes\! gets printed\! |
| :---- |

→ On correct: sign text revealed → "HEAD TO THE FALLEN LOG" — log sparkles in the distance.

**Sign 3 (near the log)**

| Q3 — Multiple Choice Question: Which if/else statement correctly checks if a number is positive or negative? A) if (num \> 0\) { print positive } else { print negative } B) if (num \= 0\) { print positive } else { print negative } C) if (num positive) { print positive } else { print negative } Correct Answer: A Wrong Feedback: Watch out for option B — it uses a single \= which is assignment, not comparison\! And option C isn't valid Java at all. Option A uses the correct comparison operator \>. Correct Feedback: Right\! You need \> to compare the number to 0\. If num is greater than 0, it's positive. Otherwise, it's negative\! |
| :---- |

→ On correct: sign text revealed → "PRESS ONWARD TO LOOP MOUNTAIN — YOU'RE ONE STEP CLOSER TO THE BUG DRAGON\!"

| Owl Farewell Dialog "You did it\! You navigated the entire Conditional Forest\! The signs have spoken — you truly  understand the power of conditions and logic." "Loop Mountain lies ahead. It's dangerous territory, but I believe in you. Now go —  and remember: every condition has a true side and a false side. Think before you leap\!" |
| :---- |

**→ TRIGGER: Transition to Level4\_Mountain**

**Scene 6 — Level 4: Loop Mountain**

* Background: 19.png (mountain bg) — wide scrolling horizontal level

* On scene load: display intro text overlay, then immediately open LessonScreen with Unit 4 content

| Intro Text Overlay "You arrive at the base of Loop Mountain. The path ahead is blocked by a massive chasm —  the Bug Dragon's corruption has shattered the old bridge into pieces.  You'll need to rebuild it to cross." |
| :---- |

**Chest Q1**

The chest (7.png) is placed at x=500. Player walks up and clicks it.

| Q1 — Multiple Choice Question: A while loop runs as long as its condition is \_\_\_\_\_\_\_\_\_\_\_. A) false B) true C) running Correct Answer: B Wrong Feedback: Think about it: the while loop KEEPS GOING as long as the condition is... which value? Correct Feedback: Correct\! A while loop runs as long as its condition is TRUE. The moment it becomes false, the loop stops\! |
| :---- |

→ On correct: chest opens with sparkle, disappears, replaced by pile (12.png).

**Bridge Q2 — 3 Strikes Rule**

| Narrative Text Box "Brave programmer\! To build the bridge and cross the chasm, you must write a loop that  prints the word "bridge" exactly 5 times. This will lay each plank of the crossing,  one by one. Prove your skill\!" |
| :---- |

| Q2 — Text Input Question: Write a for loop that prints the word "bridge" exactly 5 times. Correct Answer: for (int i \= 0; i \< 5; i++) { System.out.println("bridge"); } Also accept: for (int i \= 1; i \<= 5; i++) { System.out.println("bridge"); } Also accept: Whitespace variations of the above (strip all whitespace before comparing) Wrong Feedback: Not quite\! A for loop needs three parts: initialization (int i \= 0), condition (i \< 5), and update (i++). Inside the loop body, use System.out.println("bridge"); Correct Feedback: Perfect loop\! The bridge is being built plank by plank\! |
| :---- |

| ⚠️  3-Strikes Reveal Text (shown after 3 wrong attempts) "Hmm, this one's tricky\! Here's the answer:" for (int i \= 0; i \< 5; i++) {     System.out.println("bridge"); } "A for loop has three parts inside the parentheses: where to start, when to stop, and how to count up.  The body (inside the curly braces) is what gets repeated. In this case, printing the word 'bridge'\!  Keep practicing and you'll get it\!" |
| :---- |

→ On correct (or after 3 strikes \+ explanation): background cross-fades from mountain (19.png) to bridge (20.png). Player can now walk right across. IMPORTANT: Player cannot walk past the chasm until the bridge is built — use an invisible barrier that is removed only after Q2 is resolved.

**→ Player walks across bridge. TRIGGER: Transition to Level5\_Castle.**

**Scene 7 — Level 5: The Castle — Final Boss**

* Background: 21.png (castle interior bg)

* Player sprite positioned at x=100, y=380 (left side)

* Bug Dragon (14.png) positioned at x=600, y=280 (right side), scaled to \~2x size

* No walking exploration — this is a cinematic/action scene

| Bug Dragon Dialog (opening taunts) "MWAHAHAHA\! A tiny little Code Knight dares to enter MY castle?\! How adorable.  How absolutely PATHETIC." "Do you have any idea what I've done to this kingdom? I've introduced infinite loops  into the rivers\! I've undefined every variable in the royal treasury\! I've replaced  the sunrise function with a null pointer exception\!" "You, with your little spells and your basic Java knowledge — you think YOU can stop ME?\!  I have been corrupting code since before your IDE was even installed\!" "Come then, little knight. Give me your best shot. I'll have you turned into binary  before you can even type System.out.—" |
| :---- |

**Boss Battle — Fireball Charge Mechanic**

* Display a horizontal FIREBALL CHARGE BAR at the top of the screen (x=200, y=30, w=400, h=24)

* Background bar: dark gray (0x333333) — fill bar starts at width=0

* Fill color gradient: red-orange → orange → gold as it fills

* Bar label: "FIREBALL POWER" in yellow pixel font above the bar

* Charge count: display "X / 10" to the right of the bar

* Large centered button: "⚡ CHARGE\! ⚡" — pulses scale between 1.0 and 1.05 continuously

* Each click: increment counter, update bar fill, show floating "+1" text, grow fireball sprite (13.png)

* Fireball starts at scale 0.5 and reaches scale 1.0 after 10 clicks

| Fireball Launch (on 10th click) 1\. Hide the charge button 2\. Show "FIRE\!\!" in large red pixel font for 500ms 3\. Animate fireball (13.png) from x=150 to x=580 — duration 600ms, ease Power2 4\. On tween complete: hide fireball, swap Bug Dragon from 14.png to 15.png (explosion) 5\. Scale explosion 0.5 → 2.0 (400ms) → 1.5 (300ms) → fade alpha to 0 (500ms) 6\. Flash full screen white: alpha 0 → 1 (100ms) → hold 200ms → 1 → 0 (300ms) 7\. Camera shake: this.cameras.main.shake(500, 0.015) 8\. After \~1.5 seconds: transition to EndScreen with camera fade |
| :---- |

**Scene 8 — End Screen / Victory**

* Background: 17.png (village bg) with golden light overlay/glow effect

| Victory Declaration "THE BUG DRAGON HAS BEEN DEFEATED\!" "With a single, perfectly aimed fireball — powered by knowledge, persistence, and true Java  mastery — the Bug Dragon has been vanquished. The corrupted code begins to repair itself.  Variables realign. Loops find their proper ends. The rivers flow clean once more." "Across the kingdom, programs flicker back to life. The villagers step outside, blinking in  the sunlight, and whisper a name — YOUR name. The Code Knight who saved them all." "Villager 1, tears in his eyes, says: 'I knew it from the moment I saw you. The spark was  always there.' The witch smiles knowingly and says nothing — she already knew. And the boy  with the cow? He's going to tell this story forever." "The Code Kingdom is saved. But this... is not the end of your journey." |
| :---- |

| Mentor Sendoff (scroll/owl icon style box) "You did it, young programmer. You really, truly did it. But here's the secret that every  great developer eventually learns: the real adventure isn't defeating dragons.  It's what you BUILD after the battle is over." "Everything you learned on this quest — printing to the screen, declaring variables, making  decisions with if/else, repeating actions with loops — these are the same tools that real Java  developers use every day to build apps, games, websites, and systems used by millions of people." "You set up your IDE back in Level 1\. It's still there, waiting for you. Now it's time to use it  — not to answer questions, but to CREATE something of your own." "Go forth, Code Knight. The kingdom may be saved — but your story as a programmer is just beginning. 🚀" |
| :---- |

**Final Project Cards (display as styled cards)**

| 🎮 Project 1: The Story Quiz Game Create a choose-your-own-adventure text game in Java\! Ask the player questions with different choices, use if/else statements to send them down different story paths, and build at least 2 different endings. Example: "You stand before two doors. Do you go LEFT or RIGHT?" Let their choice determine what happens next\! |
| :---- |

| 🔢 Project 2: The Number Guessing Game Have the computer secretly pick a random number (look up Math.random() or the Random class\!). Use a loop to keep asking the player to guess until they get it right. Give hints: "Too high\!", "Too low\!", "Getting warmer\!", "Getting colder\!" Celebrate when they finally guess correctly\! |
| :---- |

| 🎨 Project 3: The Pattern Designer Use nested for loops (a loop inside a loop\!) to print a pattern made of characters like \*, \#, or @. Be creative — try making a triangle, a checkerboard, or a diamond. Example triangle output:   \*   \*\*   \*\*\*   \*\*\*\* |
| :---- |

**Display at the bottom: "⭐ CONGRATULATIONS, CODE KNIGHT ⭐" and "You have completed the Java Coding Curriculum\!"**

Add a PLAY AGAIN button that reloads the game from the Home Screen.

**PART 4 — IMPLEMENTATION GUIDE**

**Recommended Project Structure**

| /code-kingdom   /assets     1.png  through  21.png   (all provided)   /src     main.js              ← game entry point, Phaser config     gameState.js         ← global state object     scenes/       HomeScreen.js       CutsceneBackstory.js       Level1\_Village.js       Level2\_Cauldron.js       Level3\_Forest.js       Level4\_Mountain.js       Level5\_Castle.js       EndScreen.js     systems/       DialogSystem.js       QuestionPopup.js       LessonScreen.js     data/       lessonContent.js   ← all 4 unit lesson texts       questionData.js    ← all question objects       dialogData.js      ← all NPC dialog lines   index.html |
| :---- |

**Phaser 3 Configuration (main.js)**

| import Phaser from 'phaser'; const config \= {   type: Phaser.AUTO,   width: 800,   height: 450,   backgroundColor: '\#1a1a2e',   scale: {     mode: Phaser.Scale.FIT,     autoCenter: Phaser.Scale.CENTER\_BOTH   },   physics: {     default: 'arcade',     arcade: { gravity: { y: 0 }, debug: false }   },   scene: \[     HomeScreen, CutsceneBackstory, Level1\_Village,     Level2\_Cauldron, Level3\_Forest, Level4\_Mountain,     Level5\_Castle, EndScreen   \] }; new Phaser.Game(config); |
| :---- |

**Global Game State (gameState.js)**

| const gameState \= {   // Level 1 conversation flags   talkedToVillager1: false,   talkedToVillager2: false,   talkedToVillager3: false,   talkedToVillager4: false,   // Lesson viewed flags   lesson1Viewed: false,   lesson2Viewed: false,   lesson3Viewed: false,   lesson4Viewed: false,   // Questions answered flags (L1=Level1, L2=Level2, etc.)   answeredQ1\_L1: false,  answeredQ2\_L1: false,  answeredQ3\_L1: false,   answeredQ1\_L2: false,  answeredQ2\_L2: false,  answeredQ3\_L2: false,   answeredQ1\_L3: false,  answeredQ2\_L3: false,  answeredQ3\_L3: false,   answeredQ1\_L4: false,  answeredQ2\_L4: false,   // Special 3-strikes counter for Mountain Q2   mountainQ2Attempts: 0,   mountainQ2Revealed: false,   // Bridge / boss state   bridgeBuilt: false,   fireballCharges: 0,   dragonDefeated: false,   // UI lock flags   dialogOpen: false,   questionOpen: false,   lessonOpen: false,   currentLevel: 'home' }; export default gameState; |
| :---- |

**Dialog System Spec**

* Run as a Phaser Scene in parallel (launch mode) on top of gameplay scenes

* Accept an array: \[{ speaker, portrait, text }, ...\]

* Dark semi-transparent rounded rectangle: y=337, width=800, height=113, fill black alpha 0.85, border gold

* Speaker portrait on left (\~80×80px), speaker name in yellow size 10px above text

* Dialog text in white size 8px, word-wrapped at 620px, positioned right of portrait

* Blinking ▼ arrow: tween alpha 1→0 every 500ms

* Typewriter effect: 40ms per character; clicking mid-type shows full text instantly

* Add 100ms delay before enabling click-to-advance (prevents accidental skips)

* On final line closed: emit DIALOG\_CLOSED, resume player movement

**Question Popup Spec**

* Centered parchment box: width 680px, background 0x2a1a0e, border 3px gold, rounded corners

* Question text at top: white Press Start 2P, size 8px, 20px padding, word-wrapped

* Multiple choice: 3 stacked buttons (620×44px each), dark brown bg, gold border on hover

* Text input: HTML DOM input element overlaid on canvas, gold border, with SUBMIT button

* Wrong: shake box (rapid x oscillation 8px, 300ms), flash border red, show wrong feedback in red

* Correct: flash border green, show correct feedback in green, close after 1.5 seconds

* 3-strikes panel (Mountain Q2 only): swap to blue background, show answer in code block, show explanation, show GOT IT → button

**Lesson Screen Spec**

* Full-screen opaque overlay (0x0d0d1a)

* Gold header bar (50px tall) with unit title in black centered

* Scrollable content area below: mouse wheel or drag to scroll

* Section headers: yellow, size 9px | Body text: white, size 7px, line height 18px

* Code blocks: green text (\#00FF88), Courier New font, dark box background (0x0a0a14), green border

* Callout boxes (💡 ⚠️ 🔍): tinted background \+ gold border \+ 12px padding

* Scroll indicator bar on right edge

* CONTINUE → button: fixed at bottom, disabled/gray for first 4 seconds OR until near bottom of content

**Player Character System**

| // Sprites Idle: 1.png  |  Walk: alternate 1.png / 2.png every 200ms Flip scaleX \= \-1 when moving left, restore to 1 when moving right Scale: 2.5x original pixel size Origin: (0.5, 1.0) — centered horizontally, anchored at feet // Movement Speed: 160px/second horizontal Jump velocity: \-300 (only when on ground) Ground y: 410 // Movement is BLOCKED when: gameState.dialogOpen \= true  || gameState.questionOpen \= true  || gameState.lessonOpen \= true // Camera Smooth follow: lerp 0.1 horizontal only Clamped to level world bounds (set per level) |
| :---- |

**NPC System**

* Each NPC is a static sprite at a fixed x position — does not move

* Faces toward the player at all times (flip scaleX based on player x vs NPC x)

* Interaction zone: circular, radius \~80px — use Phaser overlap detection

* Within range: show floating \! above NPC (tween y oscillation 5px, 800ms period)

* Out of range (\>80px): hide the indicator

* setInteractive() on each NPC sprite; only trigger dialog if player is within 80px

| NPC Talk Lock System Villager 2: always interactive from start Villager 3: locked until gameState.talkedToVillager2 \= true Villager 4: locked until gameState.talkedToVillager3 \= true If player clicks a locked NPC: show floating text above player head: "I should talk to someone else first..." — rises 20px and fades over 1.5 seconds |
| :---- |

**Background Scrolling & World Bounds**

| // Set world bounds per level this.physics.world.setBounds(0, 0, LEVEL\_WIDTH, 450); this.cameras.main.setBounds(0, 0, LEVEL\_WIDTH, 450); // Recommended level widths Level 1 Village:   3000px Level 3 Forest:    2500px Level 4 Mountain:  2000px // Character X positions Level 1: Villager1=300, Villager2=900, Villager3=1600, Witch=2300, Cauldron=2500 Level 3: Owl=250, Sign1=600, Rock=1100, Sign2=1150, Log=1700, Sign3=1750 Level 4: Chest/Pile=500, Barrier=880 |
| :---- |

**Scene Transition System**

| // Fade OUT (leaving a scene) this.cameras.main.fadeOut(400, 0, 0, 0); this.cameras.main.once('camerafadeoutcomplete', () \=\> {   this.scene.start('NextSceneName'); }); // Fade IN (entering a scene — put in create()) this.cameras.main.fadeIn(400, 0, 0, 0); |
| :---- |

**UI Layer Depth (setDepth values)**

| background.setDepth(0) ground.setDepth(1) objects (chest, signs, cauldron...).setDepth(2) npcs.setDepth(3) player.setDepth(4) interaction indicators.setDepth(5) dialogBox.setDepth(10) questionPopup.setDepth(11) lessonScreen.setDepth(12) fadeOverlay.setDepth(99) |
| :---- |

**Error Handling & Edge Cases**

| Handle These Specific Situations 1\. PLAYER TRIES TO WALK PAST CHASM (before bridge):    → Invisible static physics body at x=880, width=20, height=150    → Player collides with it. Remove after gameState.bridgeBuilt \= true 2\. PLAYER CLICKS LOCKED NPC:    → Floating text: "I should talk to someone else first..."    → Tween: rises 20px, fades alpha 1→0 over 1.5 seconds 3\. TEXT INPUT NORMALIZATION (Village Q1 and Mountain Q2):    → Trim whitespace, collapse multiple spaces    → For Mountain Q2: strip ALL whitespace before comparing core logic 4\. LESSON SCREEN SCROLL UNLOCK:    → Once player scrolls within 100px of bottom, unlock CONTINUE even if they scroll back up 5\. DIALOG CLICK-THROUGH ON FIRST FRAME:    → Add 100ms delay before enabling click-to-advance after opening any dialog 6\. BROWSER RESIZE:    → Phaser Scale.FIT handles this automatically    → Use this.cameras.main.width / height for all UI positioning (not hardcoded px) |
| :---- |

**Data File Structure**

Store all content in dedicated data files to keep scene files clean:

| // questionData.js — named exports per question export const VILLAGE\_Q1 \= {   id: 'village\_q1',   question: 'How do you print the text ...',   type: 'text\_input',   correctAnswer: 'System.out.println(...);',   wrongFeedback: 'Not quite\! ...',   correctFeedback: 'That\\'s right\! ...' }; // ... VILLAGE\_Q2, VILLAGE\_Q3, CAULDRON\_Q1 ... etc // dialogData.js — named arrays per NPC/scene export const VILLAGER1\_GREETING \= \[   { speaker: 'Villager 1', portrait: 'villager1', text: '...' },   { speaker: 'Villager 1', portrait: 'villager1', text: '...' }, \]; // ... VILLAGER2\_DIALOG, OWL\_INTRO, DRAGON\_TAUNTS ... etc // lessonContent.js — keyed by lesson ID export const LESSONS \= {   lesson1: { title: 'Unit 1: Introduction to Java', sections: \[ ... \] },   lesson2: { ... },   lesson3: { ... },   lesson4: { ... } }; |
| :---- |

**Audio (Optional but Recommended)**

* All audio: source royalty-free 8-bit sounds from OpenGameArt.org or similar

* Music volume cap: 0.4 | SFX volume cap: 0.7

* Village / Home Screen: cheerful upbeat 8-bit loop

* Forest: mysterious, slightly eerie 8-bit loop

* Mountain: tense, dramatic 8-bit loop

* Castle / Boss: intense fast-paced 8-bit battle music

* End Screen: triumphant victory fanfare

* SFX: dialog blip, correct chime (3 notes up), wrong buzz (2 notes down), NPC pop, fireball charge tick (each click slightly higher pitch), fireball whoosh \+ explosion

**PART 5 — TESTING CHECKLIST**

Before considering the game complete, verify every item on this list:

**Core Flow**

* \[ \]  Home screen loads with village background and click-to-start prompt

* \[ \]  Backstory cutscene plays all 6 lines in order, advances on click

* \[ \]  Level 1 loads with player spawning on left side

* \[ \]  Player can walk left and right; jumps with W / Up Arrow

* \[ \]  Player sprite flips correctly when changing direction

* \[ \]  Walk animation alternates between 1.png and 2.png while moving

**Level 1 — Village**

* \[ \]  Villager 1 visible at game start, shows \[TALK\] indicator on approach

* \[ \]  Clicking Villager 1 opens correct dialog sequence

* \[ \]  Lesson 1 opens after Villager 1 dialog

* \[ \]  Lesson screen is scrollable; CONTINUE button unlocks after delay/scroll

* \[ \]  After lesson, Villager 1 post-lesson dialog plays correctly

* \[ \]  Villager 2 is off-screen initially; walking right reveals them

* \[ \]  Villager 2 dialog opens Q1 (text input)

* \[ \]  Wrong answer shakes popup and shows red feedback

* \[ \]  Correct answer closes popup and Villager 2 finishes dialog

* \[ \]  Villager 3 is LOCKED before talking to Villager 2

* \[ \]  Villager 3 unlocks after Villager 2 dialog complete

* \[ \]  Villager 3 opens Q2 (multiple choice)

* \[ \]  Villager 4 is LOCKED before talking to Villager 3

* \[ \]  Villager 4 opens Q3 (multiple choice)

* \[ \]  Scene transitions to Level 2 after Villager 4 final dialog

**Level 2 — Cauldron**

* \[ \]  Lesson 2 opens automatically on scene load

* \[ \]  Three cauldron questions trigger in correct order

* \[ \]  Ingredient animations play on each correct answer

* \[ \]  Scene transitions to Level 3 after all 3 correct

**Level 3 — Forest**

* \[ \]  Owl dialog and Lesson 3 display correctly

* \[ \]  Sign 1 is clickable, triggers Q1

* \[ \]  Sign 1 reveals direction text after correct answer

* \[ \]  Rock sparkles to guide player to Sign 2

* \[ \]  Sign 2 is clickable, triggers Q2; reveals direction after correct

* \[ \]  Log sparkles to guide player to Sign 3

* \[ \]  Sign 3 is clickable, triggers Q3; reveals final direction after correct

* \[ \]  Owl farewell dialog plays after all 3 signs answered

* \[ \]  Scene transitions to Level 4

**Level 4 — Mountain**

* \[ \]  Lesson 4 opens automatically on scene load

* \[ \]  Chest is clickable, triggers Q1

* \[ \]  Chest disappears and pile appears after Q1 correct

* \[ \]  Player CANNOT walk past the chasm before bridge is built (invisible wall blocks them)

* \[ \]  Q2 opens after pile appears

* \[ \]  Wrong answer feedback works correctly

* \[ \]  After 3 wrong answers: answer reveal panel shows with full explanation

* \[ \]  Correct answer (or post-reveal): bridge BG loads, barrier removed

* \[ \]  Player can walk right across the bridge

* \[ \]  Scene transitions to Level 5

**Level 5 — Castle**

* \[ \]  Bug Dragon sprite (14.png) visible on right side of screen

* \[ \]  Dragon taunts dialog plays on scene load

* \[ \]  Charge bar starts empty

* \[ \]  Each click increments bar by 10% and updates counter

* \[ \]  Fireball sprite (13.png) grows with each charge click

* \[ \]  After 10 clicks: fireball launches across screen with tween animation

* \[ \]  Hit animation plays: screen flash, camera shake

* \[ \]  Bug Dragon swaps to dead/explosion sprite (15.png) with scale animation

* \[ \]  End screen transition fires after animations complete

**End Screen**

* \[ \]  Victory text and all dialog lines display correctly

* \[ \]  Mentor sendoff dialog plays after victory declaration

* \[ \]  Three project cards display correctly and are readable

* \[ \]  PLAY AGAIN button reloads to Home Screen

| 🚀 Final Note to the Developer This is the complete specification for Code Kingdom. All 21 asset PNG files are provided — use them exactly as labeled. Build order recommendation:   1\. Set up Phaser project structure and asset preloading   2\. Build DialogSystem, QuestionPopup, and LessonScreen (reusable systems first)   3\. Build the gameState object and player movement system   4\. Build Level 1 end-to-end as your proof of concept   5\. Build remaining levels in order   6\. Add transitions, boss battle, and end screen last   7\. Run through the full testing checklist before shipping Good luck — and may your code be bug-free\! ⚔️ |
| :---- |

