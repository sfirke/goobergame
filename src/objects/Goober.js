import Phaser from 'phaser';

/**
 * Goober — the player character.
 *
 * Rendered as a chipmunk emoji 🐿️.
 * Can jump with W/UP and steer left/right in the air (A/D or arrows).
 * Emoji flips to face the direction of travel.
 */
export class Goober extends Phaser.GameObjects.Text {
  constructor(scene, x, y, minX = 0, maxX = Infinity) {
    super(scene, x, y, '🐿️', {
      fontSize: '48px',
      color: '#000000',
    });
    this.setOrigin(0.5, 1);
    this.setDisplaySize(40, 48);

    // Direction tracking: 1 = right (default), -1 = left
    this._facing = 1;

    // Boundary constraints
    this._minX = minX;
    this._maxX = maxX;

    // Input setup
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this._aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this._dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

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
  // gameSpeed: current platform scroll speed (pixels/sec), used to scale squirrel movement
  update(gameSpeed = 200) {
    // Jump input (Up arrow or W)
    const justPressed =
      Phaser.Input.Keyboard.JustDown(this._cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this._wKey);

    if (justPressed) {
      this._jump();
    }

    // In-air steering (left/right)
    // Squirrel moves 1.2x the platform speed, ensuring it can always outrun the scroll
    const speed = Math.max(300, gameSpeed * 1.2);
    let velocityX = 0;

    if (this._cursors.left.isDown || this._aKey.isDown) {
      velocityX = -speed;
      this._facing = -1;
    } else if (this._cursors.right.isDown || this._dKey.isDown) {
      velocityX = speed;
      this._facing = 1;
    }

    // Apply horizontal velocity
    if (this.body) {
      this.body.setVelocityX(velocityX);
    }

    // Enforce boundaries.
    // Only zero velocity if it's pushing *into* the wall — preserve velocity
    // pointing away (so rightward input isn't cancelled by the left-wall push).
    if (this.x < this._minX) {
      this.x = this._minX;
      if (this.body && this.body.velocity.x < 0) {
        this.body.setVelocityX(0);
      }
    }
    if (this.x > this._maxX) {
      this.x = this._maxX;
      if (this.body && this.body.velocity.x > 0) {
        this.body.setVelocityX(0);
      }
    }

    // Face the direction of travel
    this.setScale(-this._facing, 1);
  }

  _jump() {
    if (this.body && this.body.blocked.down) {
      this.body.setVelocityY(-500); // increased from -400 for better air control time
      this.emit('jumped');
    }
  }
}

