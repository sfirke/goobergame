import Phaser from 'phaser';

/**
 * GameOverScene — shown when Goober hits a worm.
 *
 * Receives `{ score }` from GameScene via scene.start().
 * Press ESC or tap to restart.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  // init() runs before create() and receives the data object passed by scene.start()
  init(data) {
    this.finalScore = data.score ?? 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dim overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55);

    // "Game Over" heading
    this.add.text(W / 2, H / 2 - 55, 'GAME OVER', {
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#ff4444',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // Score
    this.add.text(W / 2, H / 2 + 5, `Score: ${this.finalScore}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Restart prompt
    this.add.text(W / 2, H / 2 + 52, 'Press ESC or tap to play again', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    // Keyboard restart (Esc)
    const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey.once('down', () => this._restart());

    // Tap / click restart
    this.input.once('pointerdown', () => this._restart());
  }

  _restart() {
    this.scene.start('GameScene');
  }
}
