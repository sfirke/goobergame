import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Phaser so we can instantiate GameScene in a node (non-browser) test environment.
vi.mock('phaser', () => {
  return {
    default: {
      Scene: class {
        constructor(key) {
          this.sys = { config: { key } };
        }
      },
      Input: {
        Keyboard: {
          KeyCodes: {
            SPACE: 'SPACE',
            ESC: 'ESC',
          },
        },
      },
    },
  };
});

// Mock Goober so we don't need Phaser rendering / physics in unit tests.
vi.mock('../src/objects/Goober.js', () => {
  return {
    Goober: class {
      constructor(scene, x, y, minX, maxX) {
        this.scene = scene;
        this.body = {
          setBounce: vi.fn(),
          setCollideWorldBounds: vi.fn(),
          setVelocityX: vi.fn(),
          setVelocityY: vi.fn(),
        };
      }
      once(event, cb) {
        // allow scene to register "jumped" handler without crashing
        if (event === 'jumped') {
          // no-op, never invoked in these tests
        }
      }
      setDepth() {
        return this;
      }
    },
  };
});

// Mock Worm so it doesn't depend on Phaser internals.
vi.mock('../src/objects/Worm.js', () => {
  return {
    Worm: class {},
  };
});

import { GameScene } from '../src/scenes/GameScene.js';

function makeMockText() {
  const callbacks = {};
  const obj = {
    setOrigin: vi.fn().mockReturnThis(),
    setDepth: vi.fn().mockReturnThis(),
    setScrollFactor: vi.fn().mockReturnThis(),
    setInteractive: vi.fn().mockReturnThis(),
    setText: vi.fn().mockReturnThis(),
    on: (event, cb) => {
      callbacks[event] = cb;
      return obj;
    },
    trigger: (event) => {
      callbacks[event]?.();
    },
  };
  return obj;
}

function createTestScene() {
  const scene = new GameScene();

  // Minimal runtime scaffolding that GameScene expects.
  scene.scale = { width: 800, height: 600 };
  scene.time = { now: 1_000, paused: false };
  scene.startTime = 1_000;
  scene.physics = {
    world: {
      setBounds: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    },
    add: {
      existing: vi.fn(),
      collider: vi.fn(),
      staticGroup: () => ({
        create: () => ({
          setScale: () => ({ refreshBody: () => {} }),
        }),
      }),
    },
  };

  scene.cameras = { main: { scrollX: 0 } };
  scene.scene = { start: vi.fn() };

  const keyFactory = () => {
    let downCb = null;
    return {
      on: (event, cb) => {
        if (event === 'down') downCb = cb;
      },
      triggerDown: () => {
        downCb?.();
      },
    };
  };

  scene.input = {
    keyboard: {
      addKey: () => keyFactory(),
    },
  };

  const makeMockShape = () => {
    const obj = {
      setScrollFactor: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setOrigin: vi.fn().mockReturnThis(),
      setStrokeStyle: vi.fn().mockReturnThis(),
    };
    return obj;
  };

  scene.add = {
    rectangle: () => makeMockShape(),
    text: () => makeMockText(),
    container: () => ({ destroy: vi.fn() }),
    existing: vi.fn(),
    group: () => ({ getChildren: () => [] }),
  };

  return scene;
}

describe('GameScene pause + restart', () => {
  let scene;

  beforeEach(() => {
    scene = createTestScene();
    scene.create();
  });

  it('pauses and resumes when SPACE is pressed', () => {
    expect(scene.isPaused).toBe(false);

    scene.pauseKey.triggerDown();

    expect(scene.isPaused).toBe(true);
    expect(scene.physics.world.pause).toHaveBeenCalled();
    expect(scene.time.paused).toBe(true);
    expect(scene.pauseButton.setText).toHaveBeenCalledWith('Resume (SPACE)');
    expect(scene._pauseOverlay).toBeDefined();

    scene.pauseKey.triggerDown();

    expect(scene.isPaused).toBe(false);
    expect(scene.physics.world.resume).toHaveBeenCalled();
    expect(scene.time.paused).toBe(false);
    expect(scene.pauseButton.setText).toHaveBeenCalledWith('Pause (SPACE)');
    expect(scene._pauseOverlay).toBeNull();
  });

  it('restarts the game when ESC is pressed', () => {
    scene.pauseKey.triggerDown();
    expect(scene.isPaused).toBe(true);

    scene.escapeKey.triggerDown();

    // Restart should unpause and then start the scene.
    expect(scene.isPaused).toBe(false);
    expect(scene.scene.start).toHaveBeenCalledWith('GameScene');
  });

  it('adjusts startTime so score/speed don\'t jump after unpausing', () => {
    const originalStartTime = 1000;
    scene.startTime = originalStartTime;

    // Pause at time 1_500
    scene.time.now = 1_500;
    scene._setPaused(true);

    // Resume at time 2_500
    scene.time.now = 2_500;
    scene._setPaused(false);

    // startTime should have advanced by the pause duration (1_000 ms).
    expect(scene.startTime).toBe(originalStartTime + 1_000);
  });
});
