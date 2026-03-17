import Phaser from 'phaser';
import { Goober } from '../objects/Goober.js';
import { Worm } from '../objects/Worm.js';
import { calcScore, getGameSpeed, getWormSpawnDelay } from '../logic/scoring.js';

// Layout constants — tweak these to adjust feel
const GROUND_TOP_Y = 262;   // y where the visible ground surface starts
const GROUND_Y = 270;       // y of the invisible physics ground body (center)

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  create() {
    this.startTime = this.time.now;

    this._buildBackground();
    this._buildGround();

    // Game objects
    this.goober = new Goober(this, 120, GROUND_TOP_Y - 24);
    this.add.existing(this.goober);
    this.physics.add.existing(this.goober);

    this.worms = this.add.group();

    // Collide Goober with the ground so she lands on it
    this.physics.add.collider(this.goober, this.groundBody);

    // Overlap Goober with any worm → die
    this.physics.add.overlap(
      this.goober,
      this.worms,
      this._onHitWorm,
      null,
      this
    );

    // Score text (top-right corner)
    this.scoreText = this.add.text(780, 14, 'Score: 0', {
      fontSize: '18px',
      color: '#1a1a1a',
      fontFamily: 'monospace',
    }).setOrigin(1, 0).setDepth(10);

    // "Tap / Space to start" hint
    this.hintText = this.add.text(400, 130, '🐿️  Press SPACE or swipe up to jump!', {
      fontSize: '16px',
      color: '#1a1a1a',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5).setDepth(10);

    // Remove the hint on first jump
    this.goober.once('jumped', () => {
      if (this.hintText) {
        this.hintText.destroy();
        this.hintText = null;
      }
    });

    // Schedule first worm
    this._scheduleNextWorm();

    this.isDead = false;
  }

  update(time, _delta) {
    if (this.isDead) return;

    const elapsed = time - this.startTime;

    // Update score display
    const score = calcScore(elapsed);
    this.scoreText.setText(`Score: ${score}`);

    // Scroll background layers at different speeds for parallax
    const speed = getGameSpeed(elapsed);
    this._scrollBackground(speed);

    // Update Goober (handles input internally)
    this.goober.update();

    // Move worms left; remove any that have gone off the left edge
    this.worms.getChildren().forEach((worm) => {
      worm.x -= (speed / 60); // speed is px/s; update runs ~60fps
      if (worm.x < -60) {
        worm.destroy();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Background
  // -------------------------------------------------------------------------

  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Sky gradient using a single blue rect (Phaser bgcolor handles the main sky)
    this.add.rectangle(W / 2, H / 2, W, H, 0x87ceeb).setDepth(0);

    // Clouds — 4 simple puffy white blobs made of overlapping ellipses
    this.cloudLayer = this.add.group();
    const cloudPositions = [
      { x: 120, y: 45 },
      { x: 350, y: 35 },
      { x: 580, y: 55 },
      { x: 800, y: 42 },
    ];
    cloudPositions.forEach(({ x, y }) => {
      this.cloudLayer.add(this._makeCloud(x, y));
    });

    // Hills / trees silhouette row
    this.hillLayer = this.add.group();
    const hillPositions = [
      { x: 100, w: 160, h: 60 },
      { x: 320, w: 200, h: 80 },
      { x: 520, w: 140, h: 50 },
      { x: 720, w: 180, h: 70 },
    ];
    hillPositions.forEach(({ x, w, h }) => {
      this.hillLayer.add(this._makeHill(x, w, h));
    });

    // Ground stripe (visual only — physics is a separate invisible body)
    this.add.rectangle(W / 2, GROUND_TOP_Y + (H - GROUND_TOP_Y) / 2, W, H - GROUND_TOP_Y, 0x5a9e3a).setDepth(1);
    // Darker stripe at the very top of the ground for a "dirt edge" look
    this.add.rectangle(W / 2, GROUND_TOP_Y + 6, W, 12, 0x3d7a22).setDepth(1);
  }

  _makeCloud(x, y) {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0xffffff, 0.92);
    g.fillEllipse(0, 0, 70, 32);
    g.fillEllipse(-22, -10, 42, 28);
    g.fillEllipse(22, -8, 48, 28);
    g.x = x;
    g.y = y;
    return g;
  }

  _makeHill(x, w, h) {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x4a8c2a, 1);
    g.fillEllipse(0, h / 2, w, h * 1.2);
    g.x = x;
    g.y = GROUND_TOP_Y - h / 2;
    return g;
  }

  _scrollBackground(speedPxPerSec) {
    const W = this.scale.width;
    const cloudSpeed = speedPxPerSec * 0.15;  // clouds drift slowly
    const hillSpeed = speedPxPerSec * 0.40;   // hills scroll at medium speed

    this.cloudLayer.getChildren().forEach((cloud) => {
      cloud.x -= cloudSpeed / 60;
      // Wrap: when fully off-screen left, reappear off-screen right
      if (cloud.x < -80) cloud.x = W + 80;
    });

    this.hillLayer.getChildren().forEach((hill) => {
      hill.x -= hillSpeed / 60;
      if (hill.x < -150) hill.x = W + 150;
    });
  }

  // -------------------------------------------------------------------------
  // Ground physics body
  // -------------------------------------------------------------------------

  _buildGround() {
    // Invisible static rectangle the Goober lands on
    this.groundBody = this.physics.add.staticGroup();
    this.groundBody
      .create(this.scale.width / 2, GROUND_Y, null)
      .setSize(this.scale.width, 16)
      .setAlpha(0)
      .refreshBody();
  }

  // -------------------------------------------------------------------------
  // Worm spawning
  // -------------------------------------------------------------------------

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
    // Spawn worm at ground level, off the right edge
    const worm = new Worm(this, this.scale.width + 30, GROUND_TOP_Y);
    this.add.existing(worm);
    this.physics.add.existing(worm);
    worm.body.allowGravity = false;
    this.worms.add(worm);
  }

  // -------------------------------------------------------------------------
  // Death
  // -------------------------------------------------------------------------

  _onHitWorm() {
    if (this.isDead) return;
    this.isDead = true;

    const elapsed = this.time.now - this.startTime;
    const finalScore = calcScore(elapsed);

    // Brief camera shake for impact
    this.cameras.main.shake(250, 0.012);

    this.time.delayedCall(400, () => {
      this.scene.start('GameOverScene', { score: finalScore });
    });
  }
}
