export const LESSONS = {
  lesson1: {
    title: 'Unit 1: Introduction to Java',
    sections: [
      { type: 'header', text: 'Unit 1: Introduction to Java' },
      { type: 'header', text: 'What Is Java?' },
      {
        type: 'body',
        text: 'Java is one of the most popular programming languages in the world.\nIt powers apps, games, websites, and even space missions.\nWhen you write Java code, you are giving instructions to a computer -- step by step, line by line.',
      },
      { type: 'header', text: 'Your First Line of Code' },
      { type: 'code', text: 'System.out.println("Hello, World!");' },
      {
        type: 'body',
        text: 'This single line tells Java: print this text to the screen.\nSystem.out is the "output channel." println means "print this line."\nThe text you want to print goes inside double quotes " ".',
      },
      {
        type: 'callout',
        text: 'Every Java statement ends with a semicolon ; -- just like a period ends a sentence. Forget it, and Java will refuse to run!',
      },
      { type: 'header', text: 'Rules of Java' },
      {
        type: 'body',
        text: '* Java is CASE-SENSITIVE. System is not the same as system.\n* Code runs from TOP to BOTTOM, one line at a time.\n* Every statement ends with a semicolon ;\n* Code blocks are wrapped in curly braces { }',
      },
      { type: 'header', text: 'Comments' },
      {
        type: 'code',
        text: '// This is a comment -- Java ignores this line\nSystem.out.println("This runs!"); // This runs',
      },
      {
        type: 'body',
        text: 'Comments are notes you write for yourself (and other programmers).\nStart a line with // and Java will skip it entirely.',
      },
      {
        type: 'callout',
        text: 'A program that prints "Hello, World!" is the traditional first program every programmer writes. You just wrote yours!',
      },
    ],
  },

  lesson2: {
    title: 'Unit 2: Variables & Data Types',
    sections: [
      { type: 'header', text: 'Unit 2: Variables & Data Types' },
      { type: 'header', text: 'What Is a Variable?' },
      {
        type: 'body',
        text: 'A variable is like a magic box with a label on it.\nYou can put a value inside, and use it later in your program.',
      },
      {
        type: 'code',
        text: 'int score = 10;\nString name = "Code Knight";\nboolean isHero = true;',
      },
      {
        type: 'body',
        text: 'The word before the variable name is the DATA TYPE -- it tells Java what kind of value to expect inside the box.',
      },
      { type: 'header', text: 'The Four Main Data Types' },
      {
        type: 'body',
        text: 'int      -- whole numbers: 0, 5, -3, 1000\ndouble   -- decimal numbers: 3.14, 9.99, -0.5\nString   -- text (words, sentences): "Hello!" "Code Knight"\nboolean  -- true or false -- only two possible values',
      },
      {
        type: 'callout',
        text: 'String starts with a CAPITAL S. All other types are lowercase.',
      },
      { type: 'header', text: 'Using Variables' },
      {
        type: 'code',
        text: 'String hero = "Code Knight";\nSystem.out.println(hero);',
      },
      {
        type: 'body',
        text: 'When printing a VARIABLE, there are NO quotes around it.\nprintln(hero) prints the VALUE stored in hero.\nprintln("hero") prints the WORD hero literally.',
      },
      { type: 'header', text: 'Arithmetic & the % Operator' },
      {
        type: 'code',
        text: 'int a = 9;\nint b = 4;\nSystem.out.println(a + b);  // 13\nSystem.out.println(a % b);  // 1 (remainder of 9 / 4)',
      },
      {
        type: 'body',
        text: '+  adds     -  subtracts     *  multiplies\n/  divides  %  gives the REMAINDER',
      },
      {
        type: 'callout',
        text: 'The % operator is called MODULUS. 9 % 4 = 1 because 9 / 4 = 2 remainder 1. Very useful for checking if a number is even or odd!',
      },
    ],
  },

  lesson3: {
    title: 'Unit 3: Conditionals',
    sections: [
      { type: 'header', text: 'Unit 3: Conditionals' },
      { type: 'header', text: 'Making Decisions in Code' },
      {
        type: 'body',
        text: 'Real programs do not just run the same instructions every time.\nThey make DECISIONS based on conditions -- just like you do every day.\n"If it is raining, I will bring an umbrella."',
      },
      {
        type: 'code',
        text: 'if (isRaining == true) {\n    System.out.println("Bring an umbrella!");\n} else {\n    System.out.println("Enjoy the sunshine!");\n}',
      },
      { type: 'header', text: 'The = vs == Trap' },
      {
        type: 'code',
        text: 'int x = 5;        // = ASSIGNS the value 5 to x\nif (x == 5) { }   // == ASKS: is x equal to 5?',
      },
      {
        type: 'callout',
        text: 'Using = inside an if condition is one of the most common bugs in Java. Always use == when COMPARING values!',
      },
      { type: 'header', text: 'Comparison Operators' },
      {
        type: 'body',
        text: '==  equal to          !=  not equal to\n>   greater than       <   less than\n>=  greater or equal  <=  less or equal',
      },
      {
        type: 'code',
        text: 'if (score >= 100) {\n    System.out.println("You win!");\n}',
      },
      { type: 'header', text: 'Logical Operators: AND and OR' },
      {
        type: 'code',
        text: '// AND: both conditions must be true\nif (hasKey && doorIsLocked) { ... }\n\n// OR: at least one condition must be true\nif (isHero || hasSword) { ... }',
      },
      {
        type: 'body',
        text: '&& means AND -- every condition must be true for the block to run.\n|| means OR -- only ONE condition needs to be true.',
      },
      {
        type: 'callout',
        text: '|| is your friend when you need flexibility. && is strict -- every condition must pass.',
      },
      { type: 'header', text: 'else if -- Chaining Conditions' },
      {
        type: 'code',
        text: 'if (score > 90) {\n    System.out.println("Amazing!");\n} else if (score > 60) {\n    System.out.println("Good job!");\n} else {\n    System.out.println("Keep practicing!");\n}',
      },
    ],
  },

  lesson4: {
    title: 'Unit 4: Loops',
    sections: [
      { type: 'header', text: 'Unit 4: Loops' },
      { type: 'header', text: 'Why Do We Need Loops?' },
      {
        type: 'body',
        text: 'Imagine you need to print "bridge" 5 times.\nYou could write 5 println statements... but what if you needed 1000?\nLoops let you repeat instructions without rewriting them.',
      },
      { type: 'header', text: 'The while Loop' },
      {
        type: 'code',
        text: 'int count = 0;\nwhile (count < 5) {\n    System.out.println("bridge");\n    count++;\n}',
      },
      {
        type: 'body',
        text: 'The while loop checks its condition BEFORE each repetition.\nIf the condition is true, it runs the block. Then checks again.\ncount++ means "add 1 to count" -- this is how the loop eventually stops.',
      },
      {
        type: 'callout',
        text: 'If the condition NEVER becomes false, the loop runs forever! This is called an INFINITE LOOP -- it crashes your program. Always make sure your loop has a way to stop!',
      },
      { type: 'header', text: 'The for Loop' },
      {
        type: 'code',
        text: 'for (int i = 0; i < 5; i++) {\n    System.out.println("bridge");\n}',
      },
      {
        type: 'body',
        text: 'A for loop packs three things into one line:\nint i = 0  -- Start: create a counter starting at 0\ni < 5      -- Condition: keep going while i is less than 5\ni++        -- Update: add 1 to i after each loop',
      },
      { type: 'header', text: 'Tracing a for Loop' },
      {
        type: 'body',
        text: 'i=0: 0<5? YES -- print "bridge" -- i becomes 1\ni=1: 1<5? YES -- print "bridge" -- i becomes 2\ni=2: 2<5? YES -- print "bridge" -- i becomes 3\ni=3: 3<5? YES -- print "bridge" -- i becomes 4\ni=4: 4<5? YES -- print "bridge" -- i becomes 5\ni=5: 5<5? NO  -- loop stops. "bridge" printed 5 times!',
      },
      {
        type: 'callout',
        text: 'for loops are best when you know EXACTLY how many times to repeat. while loops are best when you are waiting for something to change (like player input or a game condition).',
      },
    ],
  },
};
