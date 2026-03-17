import Phaser from 'phaser';

/**
 * Goober — the player character.
 *
 * Rendered as a chipmunk emoji 🐿️ for now (no sprite assets needed).
 * Has an arcade physics body so it collides with the ground and worms.
 *
 * Input handled here: SPACE, UP arrow, and swipe-up on touchscreens.
 * When a jump is triggered we emit a 'jumped' event so GameScene can react
 * (e.g. dismiss the hint text on the very first jump).
 */
export class Goober extends Phaser.GameObjects.Text {
  constructor(scene, x, y) {
    super(scene, x, y, '🐿️', {
      fontSize: '36px',
    });
    this.setOrigin(0.5, 1); // anchor at feet so position = ground contact point

    // Track swipe start position for mobile input
    this._swipeStartY = 0;
    const SWIPE_THRESHOLD = 40; // pixels upward to count as a swipe

    // Keyboard
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Touch / mouse swipe-up
    scene.input.on('pointerdown', (pointer) => {
      this._swipeStartY = pointer.y;
    });

    scene.input.on('pointerup', (pointer) => {
      const deltaY = this._swipeStartY - pointer.y; // positive = finger moved up
      if (deltaY > SWIPE_THRESHOLD) {
        this._jump();
      }
    });
  }

  // Called every frame from GameScene.update()
  update() {
    const justPressed =
      Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this._cursors.up);

    if (justPressed) {
      this._jump();
    }
  }

  _jump() {
    // body.blocked.down is true when standing on the ground — prevents double-jump
    if (this.body && this.body.blocked.down) {
      this.body.setVelocityY(-720);
      this.emit('jumped');
    }
  }
}
