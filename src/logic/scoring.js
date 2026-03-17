/**
 * Pure game-logic functions — no Phaser imports, no browser APIs.
 *
 * Keeping game math here (separate from Phaser scenes) means:
 *   1. We can unit-test it with Vitest in Node, no browser needed.
 *   2. The rules live in one place, not scattered across scenes.
 */

/**
 * Score is simply the number of seconds survived (rounded down).
 * The displayed score is "distance traveled" — faster survival = more points.
 *
 * @param {number} elapsedMs  - milliseconds since the run started
 * @returns {number}          - integer score
 */
export function calcScore(elapsedMs) {
  return Math.floor(elapsedMs / 1000);
}

/**
 * Horizontal scroll speed (pixels/second) as a function of elapsed time.
 * Starts at 200 px/s and grows by ~20% every 10 seconds, capped at 900 px/s.
 *
 * @param {number} elapsedMs  - milliseconds since the run started
 * @returns {number}          - speed in pixels per second
 */
export function getGameSpeed(elapsedMs) {
  const elapsedSec = elapsedMs / 1000;
  // One "level" every 10 seconds; +20% per level
  const level = Math.floor(elapsedSec / 10);
  const speed = 200 * Math.pow(1.2, level);
  return Math.min(speed, 900);
}

/**
 * How long (ms) to wait before spawning the next worm.
 * Starts at 2500ms, shrinks as the game speeds up, never below 600ms.
 *
 * @param {number} elapsedMs  - milliseconds since the run started
 * @returns {number}          - spawn delay in milliseconds
 */
export function getWormSpawnDelay(elapsedMs) {
  const speed = getGameSpeed(elapsedMs);
  // As speed doubles (200 → 400 → 800), delay halves (2500 → 1250 → 625)
  const delay = 2500 * (200 / speed);
  return Math.max(delay, 600);
}

/**
 * AABB (Axis-Aligned Bounding Box) collision detection.
 * Both boxes are defined as { x, y, width, height } where x,y is the top-left.
 *
 * @param {Object} box1  - { x, y, width, height }
 * @param {Object} box2  - { x, y, width, height }
 * @returns {boolean}     - true if boxes overlap
 */
export function checkAABBCollision(box1, box2) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}
