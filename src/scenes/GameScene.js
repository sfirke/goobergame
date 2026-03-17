import Phaser from 'phaser';
import { Goober } from '../objects/Goober.js';
import { Worm } from '../objects/Worm.js';
import { calcScore, getGameSpeed, getWormSpawnDelay } from '../logic/scoring.js';

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

    // Simple blue background
    this.add.rectangle(W / 2, H / 2, W, H, 0x87ceeb).setDepth(0);

    // Green ground bar
    this.add.rectangle(W / 2, GROUND_Y + 8, W, 16, 0x5a9e3a).setDepth(1);

    // Create Goober
    this.goober = new Goober(this, 80, GROUND_Y);
    this.add.existing(this.goober);
    this.physics.add.existing(this.goober);
    this.goober.body.setBounce(0);
    this.goober.setDepth(10);

    // Create ground platform
    this.groundPlatform = this.physics.add.staticGroup();
    this.groundPlatform.create(W / 2, GROUND_Y + 16, null).setScale(W, 1).refreshBody();

    // Collide Goober with ground
    this.physics.add.collider(this.goober, this.groundPlatform);

    // Worms group
    this.worms = this.add.group();

    // Overlap detection: Goober hits worm
    this.physics.add.overlap(
      this.goober,
      this.worms,
      this._onHitWorm,
      null,
      this
    );

    // Score display
    this.scoreText = this.add.text(W - 10, 10, 'Score: 0', {
      fontSize: '20px',
      color: '#000000',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(10);

    // Jump hint
    this.hintText = this.add.text(W / 2, H / 2, 'Press SPACE or swipe up to jump!', {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'sans-serif',
      align: 'center',
    }).setOrigin(0.5).setDepth(10);

    this.goober.once('jumped', () => {
      if (this.hintText) {
        this.hintText.destroy();
        this.hintText = null;
      }
    });

    this.isDead = false;
    this._scheduleNextWorm();
  }

  update(time, _delta) {
    if (this.isDead) return;

    const elapsed = time - this.startTime;
    const score = calcScore(elapsed);
    this.scoreText.setText(`Score: ${score}`);

    this.goober.update();

    const speed = getGameSpeed(elapsed);
    this.worms.getChildren().forEach((worm) => {
      worm.x -= speed / 60;
      if (worm.x < -50) {
        worm.destroy();
      }
    });
  }

  _scheduleNextWorm() {
    const elapsed = this.isDead ? 0 : (this.time.now - this.startTime);
    const delay = getWormSpawnDelay(elapsed);

    this.time.delayedCall(delay, () => {
      if (this.isDead) return;
      this._spawnWorm();
      this._scheduleNextWorm();
    });
  }

  _spawnWorm() {
    const worm = new Worm(this, this.scale.width + 30, GROUND_Y);
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

    const elapsed = this.time.now - this.startTime;
    const finalScore = calcScore(elapsed);

    this.time.delayedCall(300, () => {
      this.scene.start('GameOverScene', { score: finalScore });
    });
  }
}
