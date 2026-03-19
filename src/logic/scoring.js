/**
 * Pure game-logic functions — no Phaser imports, no browser APIs.
 *
 * Keeping game math here (separate from Phaser scenes) means:
 *   1. We can unit-test it with Vitest in Node, no browser needed.
 *   2. The rules live in one place, not scattered across scenes.
 */

/**
 * Score is based on distance traveled (world X position).
 * 1 point per 100 world pixels (~2 pts/sec at starting speed).
 *
 * @param {number} distancePx  - world X position traveled (pixels)
 * @returns {number}           - integer score
 */
export function calcScore(distancePx) {
  return Math.floor(distancePx / 100);
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
 * How many world pixels should elapse between worm spawns.
 * Starts at 300px, shrinks as distance increases, never below 70px.
 * Effectively: progress further → encounter worms more frequently.
 *
 * @param {number} worldX  - the player's world X position (or camera scroll X)
 * @returns {number}       - spawn distance in world pixels
 */
export function getWormSpawnDistance(worldX) {
  // Every 5000 pixels, spawn rate increases by ~1.5x (distance between worms tightens)
  const distanceLevel = Math.floor(worldX / 5000);
  const spawnDistance = 300 * Math.pow(0.85, distanceLevel);
  return Math.max(spawnDistance, 70);
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
