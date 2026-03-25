// ─── Level 1 Questions ────────────────────────────────────────────────────────
export const VILLAGE_Q1 = {
  type: 'text_input',
  question: 'How do you print the text\n"Hello, where can I find\nthe village witch?"\nin Java using one println statement?',
  validator: 'println',
  wrongFeedback: 'Not quite! Remember: System.out.println() prints text. The text goes inside double quotes, inside the parentheses. Don\'t forget the semicolon at the end!',
  correctFeedback: "That's right! You're speaking Java already!",
};

export const VILLAGE_Q2 = {
  type: 'multiple_choice',
  question: 'What punctuation mark must you put at the end of every Java statement for it to run?',
  options: ['A)  Comma  ,', 'B)  Semicolon  ;', 'C)  Period  .'],
  correctAnswer: 'B)  Semicolon  ;',
  wrongFeedback: 'Not quite! Think about how sentences end... but in Java style.',
  correctFeedback: 'Yes! Every Java statement ends with a semicolon ; — just like a period ends a sentence!',
};

export const VILLAGE_Q3 = {
  type: 'multiple_choice',
  question: 'Java reads code from top to bottom.\nTrue or False?',
  options: ['A)  True', 'B)  False', 'C)  It depends on the program'],
  correctAnswer: 'A)  True',
  wrongFeedback: 'Not quite! Think about how you read a book — left to right, top to bottom. Java works the same way!',
  correctFeedback: 'Correct! Java always reads from top to bottom, line by line!',
};

// ─── Level 3 Questions — Conditionals ────────────────────────────────────────
export const FOREST_Q1 = {
  type: 'multiple_choice',
  question: 'What symbol means "is equal to" when comparing values in an if statement?',
  options: ['A)  =', 'B)  ==', 'C)  ==='],
  correctAnswer: 'B)  ==',
  wrongFeedback: 'Remember: = ASSIGNS a value. == COMPARES values. In if conditions, always use ==!',
  correctFeedback: 'Correct! == is the equality operator for comparisons in Java!',
};

export const FOREST_Q2 = {
  type: 'multiple_choice',
  question: 'What does the else block do?',
  options: [
    'A)  It runs when the if condition is true',
    'B)  It runs when the if condition is false',
    'C)  It always runs, no matter what',
  ],
  correctAnswer: 'B)  It runs when the if condition is false',
  wrongFeedback: 'Think of if/else as a fork in the road. if takes one path when true, else takes the other path when false.',
  correctFeedback: 'Yes! The else block runs when the if condition evaluates to false!',
};

export const FOREST_Q3 = {
  type: 'multiple_choice',
  question: 'What does && mean in Java?',
  options: ['A)  OR — at least one must be true', 'B)  NOT — flips the condition', 'C)  AND — both must be true'],
  correctAnswer: 'C)  AND — both must be true',
  wrongFeedback: 'Remember: && is AND. Both conditions on either side must be true for the whole expression to be true.',
  correctFeedback: 'Exactly! && means AND — every condition must be true for the block to run!',
};

// ─── Level 4 Questions — Loops ────────────────────────────────────────────────
export const MOUNTAIN_Q1 = {
  type: 'multiple_choice',
  question: 'A while loop runs as long as\nits condition is ___________.',
  options: ['A)  false', 'B)  true', 'C)  running'],
  correctAnswer: 'B)  true',
  wrongFeedback: 'Think about it: the while loop KEEPS GOING as long as the condition is... which value?',
  correctFeedback: 'Correct! A while loop runs as long as its condition is TRUE. The moment it becomes false, the loop stops!',
};

export const MOUNTAIN_Q2 = {
  type: 'text_input',
  question: 'Write a for loop that prints\nthe word "bridge" exactly 5 times.',
  validator: 'for_bridge',
  strikeLimit: 3,
  wrongFeedback: 'Not quite! A for loop needs three parts: initialization (int i = 0), condition (i < 5), and update (i++). Inside the loop body, use System.out.println("bridge");',
  correctFeedback: 'Perfect loop! The bridge is being built plank by plank!',
  revealCode: 'for (int i = 0; i < 5; i++) {\n  System.out.println("bridge");\n}',
  revealExplanation: "A for loop has three parts: where to start, when to stop, and how to count up. The body (inside the curly braces) is what gets repeated — printing the word 'bridge'!",
};

export const MOUNTAIN_Q3 = {
  type: 'multiple_choice',
  question: 'What does i++ mean in a for loop?',
  options: ['A)  Multiply i by itself', 'B)  Add 1 to i', 'C)  Reset i to zero'],
  correctAnswer: 'B)  Add 1 to i',
  wrongFeedback: 'The ++ operator is called "increment." It adds exactly 1 to the variable each time.',
  correctFeedback: 'Right! i++ is shorthand for i = i + 1. It increments the counter by 1 each loop cycle!',
};

// ─── Level 5 Questions — Dragon Boss ─────────────────────────────────────────
export const DRAGON_Q1 = {
  type: 'multiple_choice',
  question: 'The Bug Dragon roars:\n"What prints the VALUE of\na variable called \'score\'?"',
  options: [
    'A)  System.out.println("score");',
    'B)  System.out.println(score);',
    'C)  System.out.println[score];',
  ],
  correctAnswer: 'B)  System.out.println(score);',
  wrongFeedback: "Remember: quotes make it a literal string. No quotes means Java looks up the variable's value!",
  correctFeedback: 'A fireball hits the dragon! No quotes = variable value. Quotes = literal text!',
};

export const DRAGON_Q2 = {
  type: 'multiple_choice',
  question: 'Final blow! The Dragon screams:\n"What is the output of:\nint x = 10;\nif (x > 5) {\n  println(\"yes\");\n} else {\n  println(\"no\");\n}"',
  options: ['A)  no', 'B)  yes', 'C)  Both yes and no'],
  correctAnswer: 'B)  yes',
  wrongFeedback: 'x is 10. Is 10 > 5? Yes! So the if block runs and prints "yes". The else is skipped.',
  correctFeedback: 'FINAL BLOW! x=10, 10>5 is true, so "yes" is printed. The Bug Dragon is defeated!',
};

// ─── Level 2 Questions ────────────────────────────────────────────────────────
export const CAULDRON_Q1 = {
  type: 'multiple_choice',
  question: "What data type would you use to store someone's name in Java?",
  options: ['A)  int', 'B)  boolean', 'C)  String'],
  correctAnswer: 'C)  String',
  wrongFeedback: 'Not quite! A name is made of letters and words — which data type handles text?',
  correctFeedback: 'Correct! String is used to store text like names, sentences, and words!',
};

export const CAULDRON_Q2 = {
  type: 'multiple_choice',
  question: 'What is the result of\n9 % 4\nin Java?',
  options: ['A)  2', 'B)  1', 'C)  3'],
  correctAnswer: 'B)  1',
  wrongFeedback: 'Remember: % is the modulus operator! It gives you the REMAINDER after division. 9 ÷ 4 = 2 remainder... what?',
  correctFeedback: 'Yes! 9 divided by 4 is 2 with a remainder of 1. The modulus gives you that remainder!',
};

export const CAULDRON_Q3 = {
  type: 'multiple_choice',
  question: 'What is wrong with this code?\nSystem.out.println("name");\n(Assume \'name\' is a variable.)',
  options: [
    'A)  The variable name should\n     not have quotes around it',
    'B)  println should be capitalized',
    'C)  There is a missing semicolon',
  ],
  correctAnswer: 'A)  The variable name should\n     not have quotes around it',
  wrongFeedback: "Look closely at the quotes! When you put quotes around something in println, Java treats it as literal text — not as a variable!",
  correctFeedback: "Exactly right! Writing println(\"name\") prints the word 'name' literally. To print the VARIABLE called name, write println(name) — no quotes!",
};
