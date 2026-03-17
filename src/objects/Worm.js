import Phaser from 'phaser';

/**
 * Worm — an obstacle that spawns off the right edge and travels left.
 *
 * Rendered as a worm emoji 🪱 for now.
 * `protrusion` controls how far above the ground the worm sticks up,
 * which both sets the visual position and scales the hitbox.
 */
export class Worm extends Phaser.GameObjects.Text {
  constructor(scene, x, y, protrusion) {
    // Scale the emoji relative to how far it sticks out — bigger worms are taller
    const fontSize = Math.round(Phaser.Math.Clamp(protrusion * 0.8, 24, 56));
    super(scene, x, y, '🪱', {
      fontSize: `${fontSize}px`,
    });
    this.setOrigin(0.5, 1); // anchor at base / feet
    this._protrusion = protrusion;
  }
}
