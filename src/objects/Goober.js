import Phaser from 'phaser';

/**
 * Goober — the player character.
 *
 * Rendered as a chipmunk emoji 🐿️.
 * Can jump with SPACE/UP and steer left/right in the air.
 * Emoji flips to face the direction of travel.
 */
export class Goober extends Phaser.GameObjects.Text {
  constructor(scene, x, y) {
    super(scene, x, y, '🐿️', {
      fontSize: '48px',
      color: '#000000',
    });
    this.setOrigin(0.5, 1);
    this.setDisplaySize(40, 48);

    // Direction tracking: 1 = right (default), -1 = left
    this._facing = 1;

    // Input setup
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Swipe tracking for mobile
    this._swipeStartY = 0;
    const SWIPE_THRESHOLD = 40;

    scene.input.on('pointerdown', (pointer) => {
      this._swipeStartY = pointer.y;
    });

    scene.input.on('pointerup', (pointer) => {
      const deltaY = this._swipeStartY - pointer.y;
      if (deltaY > SWIPE_THRESHOLD) {
        this._jump();
      }
    });
  }

  // Called every frame from GameScene
  update() {
    // Jump input
    const justPressed =
      Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this._cursors.up);

    if (justPressed) {
      this._jump();
    }

    // In-air steering (left/right)
    const speed = 300; // pixels/sec horizontal speed
    let velocityX = 0;

    if (this._cursors.left.isDown) {
      velocityX = -speed;
      this._facing = -1;
    } else if (this._cursors.right.isDown) {
      velocityX = speed;
      this._facing = 1;
    }

    // Apply horizontal velocity
    if (this.body) {
      this.body.setVelocityX(velocityX);
    }

    // Face the direction of travel
    this.setScale(-this._facing, 1);
  }

  _jump() {
    if (this.body && this.body.blocked.down) {
      this.body.setVelocityY(-400); // reduced from -720 (approximately half height)
      this.emit('jumped');
    }
  }
}

