import Phaser from 'phaser';

/**
 * Worm — an obstacle that spawns off the right edge and travels left.
 *
 * Rendered as a worm emoji 🪱 at a fixed size on the ground.
 */
export class Worm extends Phaser.GameObjects.Text {
  constructor(scene, x, y) {
    super(scene, x, y, '🪱', {
      fontSize: '40px',
      color: '#000000',
    });
    this.setOrigin(0.5, 1);
    this.setDisplaySize(36, 40);
    
    // Physics body will be configured by the scene after adding
    this._bodyConfigured = false;
  }
}
