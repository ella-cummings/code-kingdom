/**
 * Fade out the current scene and transition to a new one.
 * Stops all overlay scenes before starting the target.
 */
export function transitionTo(scene, targetKey, data = {}) {
  scene.cameras.main.fadeOut(400, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', () => {
    scene.scene.stop('DialogSystem');
    scene.scene.stop('QuestionPopup');
    scene.scene.stop('LessonScreen');
    scene.scene.start(targetKey, data);
  });
}

/**
 * Show a short floating text message above a position, then fade out.
 */
export function floatingText(scene, x, y, message) {
  const t = scene.add
    .text(x, y, message, { font: '7px "Press Start 2P"', fill: '#ffffff' })
    .setOrigin(0.5)
    .setDepth(6);
  scene.tweens.add({
    targets: t,
    y: y - 20,
    alpha: 0,
    duration: 1500,
    onComplete: () => t.destroy(),
  });
}
