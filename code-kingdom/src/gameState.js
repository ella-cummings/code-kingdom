const gameState = {
  // Level 1 — Village
  talkedToVillager1: false,
  talkedToVillager2: false, // set ONLY after V2 Q1 correct + post-dialog complete
  talkedToVillager3: false,
  talkedToVillager4: false,

  // Lessons viewed
  lesson1Viewed: false,
  lesson2Viewed: false,
  lesson3Viewed: false,
  lesson4Viewed: false,

  // Questions answered
  answeredQ1_L1: false,
  answeredQ2_L1: false,
  answeredQ3_L1: false,
  answeredQ1_L2: false,
  answeredQ2_L2: false,
  answeredQ3_L2: false,
  answeredQ1_L3: false,
  answeredQ2_L3: false,
  answeredQ3_L3: false,
  answeredQ1_L4: false,
  answeredQ2_L4: false,
  answeredQ3_L4: false,

  // Mountain Q2 — 3 strikes
  mountainQ2Attempts: 0,
  mountainQ2Revealed: false,
  bridgeBuilt: false,

  // Boss
  fireballCharges: 0,
  dragonDefeated: false,

  // Overlay locks — gates player movement in update()
  dialogOpen: false,
  questionOpen: false,
  lessonOpen: false,

  currentLevel: 'home',
};

export default gameState;
