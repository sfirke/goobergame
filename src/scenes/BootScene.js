import Phaser from 'phaser';

/**
 * BootScene — runs once on startup.
 *
 * Right now it immediately hands off to GameScene.
 * Later we can add a title screen, settings, or asset preloading here.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.scene.start('GameScene');
  }
}
