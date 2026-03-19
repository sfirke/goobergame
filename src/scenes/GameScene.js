import Phaser from 'phaser';
import { Goober } from '../objects/Goober.js';
import { Worm } from '../objects/Worm.js';
import { calcScore, getGameSpeed, getWormSpawnDistance, checkAABBCollision } from '../logic/scoring.js';

// Ground position
const GROUND_Y = 240;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.startTime = this.time.now;
    const W = this.scale.width;
    const H = this.scale.height;

    // Set world bounds to allow infinite scrolling to the right
    const WORLD_WIDTH = 20000;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, H);

    // Simple blue background
    this.add.rectangle(W / 2, H / 2, W, H, 0x87ceeb).setDepth(0).setScrollFactor(0);

    // Green ground bar
    this.add.rectangle(W / 2, GROUND_Y + 8, W, 16, 0x5a9e3a).setDepth(1).setScrollFactor(0);

    // Create Goober — left boundary is updated dynamically each frame to match camera scroll
    this.goober = new Goober(this, 80, GROUND_Y, 20, Infinity);
    this.add.existing(this.goober);
    this.physics.add.existing(this.goober);
    this.goober.body.setBounce(0);
    this.goober.setDepth(10);
    this.goober.body.setCollideWorldBounds(true);

    // Camera is managed manually — no auto-follow
    // scrollX only ever increases, giving a fixed rightward flow like Mario.
    this._bestScrollX = 0;

    // Create ground platform (very wide to extend across the world)
    this.groundPlatform = this.physics.add.staticGroup();
    this.groundPlatform.create(WORLD_WIDTH / 2, GROUND_Y + 16, null).setScale(WORLD_WIDTH, 1).refreshBody();

    // Collide Goober with ground
    this.physics.add.collider(this.goober, this.groundPlatform);

    // Worms group
    this.worms = this.add.group();

    // Score display (fixed to camera)
    this.scoreText = this.add.text(W - 10, 10, 'Score: 0', {
      fontSize: '20px',
      color: '#000000',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(10).setScrollFactor(0);

    // Jump hint (fixed to camera)
    this.hintText = this.add.text(W / 2, H / 2, 'Press SPACE or swipe up to jump!', {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'sans-serif',
      align: 'center',
    }).setOrigin(0.5).setDepth(10).setScrollFactor(0);

    this.goober.once('jumped', () => {
      if (this.hintText) {
        this.hintText.destroy();
        this.hintText = null;
      }
    });

    this.isDead = false;
    this._nextWormSpawnX = null;
    this._scheduleNextWorm();
  }

  update(time, delta) {
    if (this.isDead) return;

    const elapsed = time - this.startTime;
    const speed = getGameSpeed(elapsed);
    const scrollOffset = speed * (delta / 1000);
    const W = this.scale.width;

    // Auto-advance the camera at the current game speed.
    // Additionally, if the player has run close to the right edge, push the
    // camera forward to keep them in view — this is how running right builds
    // score faster (same as Mario).
    const RIGHT_MARGIN = 80;
    let newScrollX = this.cameras.main.scrollX + scrollOffset;
    newScrollX = Math.max(newScrollX, this.goober.x - (W - RIGHT_MARGIN));

    // Camera never moves backwards — assign and lock in the advance.
    this.cameras.main.scrollX = newScrollX;

    // Score is the furthest the camera has ever scrolled — can never decrease.
    this._bestScrollX = Math.max(this._bestScrollX, this.cameras.main.scrollX);
    const score = calcScore(this._bestScrollX);
    this.scoreText.setText(`Score: ${score}`);

    // Keep player horizontally clamped inside the current viewport.
    this.goober._minX = this.cameras.main.scrollX + 20;
    this.goober._maxX = this.cameras.main.scrollX + W - 20;

    this.goober.update(speed);

    // Check if enough world distance has elapsed to spawn a new worm.
    this._checkAndSpawnWorm();

    // Worms sit at fixed world positions — the camera scroll is what makes
    // them appear to move. Only destroy them once off the left of the screen.
    const camLeft = this.cameras.main.scrollX;
    this.worms.getChildren().forEach((worm) => {
      if (worm.x < camLeft - 50) {
        worm.destroy();
      }

      // Manual AABB collision check
      // Get display bounds for both Goober and Worm
      const gooberBounds = this.goober.getBounds();
      const wormBounds = worm.getBounds();

      if (
        checkAABBCollision(
          {
            x: gooberBounds.x,
            y: gooberBounds.y,
            width: gooberBounds.width,
            height: gooberBounds.height,
          },
          {
            x: wormBounds.x,
            y: wormBounds.y,
            width: wormBounds.width,
            height: wormBounds.height,
          }
        )
      ) {
        this._onHitWorm();
      }
    });
  }

  _scheduleNextWorm() {
    // Track the world X position at which the last worm should spawn
    if (!this._nextWormSpawnX) {
      this._nextWormSpawnX = this.cameras.main.scrollX + this.scale.width + 30;
    }
  }

  _checkAndSpawnWorm() {
    // Spawn a worm when we've progressed far enough into the world
    const currentSpawnX = this.cameras.main.scrollX + this.scale.width + 30;
    const spawnDistance = getWormSpawnDistance(this._nextWormSpawnX);

    if (currentSpawnX >= this._nextWormSpawnX) {
      this._spawnWorm();
      this._nextWormSpawnX += spawnDistance;
    }
  }

  _spawnWorm() {
    const worm = new Worm(this, this.cameras.main.scrollX + this.scale.width + 30, GROUND_Y);
    this.add.existing(worm);
    this.physics.add.existing(worm);
    worm.body.allowGravity = false;
    worm.body.setImmovable(true);
    worm.setDepth(5);
    this.worms.add(worm);
  }

  _onHitWorm() {
    if (this.isDead) return;
    this.isDead = true;

    const finalScore = calcScore(this._bestScrollX);

    this.time.delayedCall(300, () => {
      this.scene.start('GameOverScene', { score: finalScore });
    });
  }
}
