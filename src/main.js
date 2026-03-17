import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,           // use WebGL if available, fall back to Canvas
  parent: 'game-container',
  width: 800,
  height: 300,
  backgroundColor: '#87CEEB', // sky blue — also the fallback before the scene draws
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },   // strong gravity → snappy jumps
      debug: false,            // flip to true to see hitboxes while developing
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene, GameOverScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
