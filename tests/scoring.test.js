import { describe, it, expect } from 'vitest';
import { calcScore, getGameSpeed, getWormSpawnDistance, checkAABBCollision } from '../src/logic/scoring.js';

// ---------------------------------------------------------------------------
// calcScore
// ---------------------------------------------------------------------------
describe('calcScore', () => {
  it('is 0 at distance 0', () => {
    expect(calcScore(0)).toBe(0);
  });

  it('is 1 after exactly 100 pixels', () => {
    expect(calcScore(100)).toBe(1);
  });

  it('is 10 after exactly 1000 pixels', () => {
    expect(calcScore(1000)).toBe(10);
  });

  it('floors partial pixels', () => {
    expect(calcScore(475)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// getGameSpeed
// ---------------------------------------------------------------------------
describe('getGameSpeed', () => {
  it('starts at 200 px/s', () => {
    expect(getGameSpeed(0)).toBe(200);
  });

  it('is still 200 at 9.9 seconds (first level-up not yet reached)', () => {
    expect(getGameSpeed(9900)).toBe(200);
  });

  it('jumps to 240 at exactly 10 seconds (first level-up)', () => {
    // level 1 → 200 * 1.2^1 = 240
    expect(getGameSpeed(10_000)).toBeCloseTo(240, 5);
  });

  it('increases with time', () => {
    expect(getGameSpeed(30_000)).toBeGreaterThan(getGameSpeed(20_000));
  });

  it('never exceeds 900 px/s', () => {
    expect(getGameSpeed(999_999)).toBe(900);
  });
});

// ---------------------------------------------------------------------------
// getWormSpawnDistance
// ---------------------------------------------------------------------------
describe('getWormSpawnDistance', () => {
  it('starts at 350 pixels at worldX 0', () => {
    expect(getWormSpawnDistance(0)).toBe(350);
  });

  it('decreases as you progress further into the world', () => {
    expect(getWormSpawnDistance(10_000)).toBeLessThan(getWormSpawnDistance(0));
  });

  it('never goes below 150 pixels', () => {
    expect(getWormSpawnDistance(999_999)).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// checkAABBCollision
// ---------------------------------------------------------------------------
describe('checkAABBCollision', () => {
  it('detects overlapping boxes', () => {
    const goober = { x: 100, y: 100, width: 30, height: 40 };
    const worm = { x: 110, y: 100, width: 30, height: 40 };
    expect(checkAABBCollision(goober, worm)).toBe(true);
  });

  it('returns false when boxes do not overlap horizontally', () => {
    const goober = { x: 50, y: 100, width: 30, height: 40 };
    const worm = { x: 150, y: 100, width: 30, height: 40 };
    expect(checkAABBCollision(goober, worm)).toBe(false);
  });

  it('returns false when boxes do not overlap vertically', () => {
    const goober = { x: 100, y: 50, width: 30, height: 40 };
    const worm = { x: 100, y: 150, width: 30, height: 40 };
    expect(checkAABBCollision(goober, worm)).toBe(false);
  });

  it('detects collision when boxes just touch at edges', () => {
    const goober = { x: 100, y: 100, width: 30, height: 40 };
    const worm = { x: 130, y: 100, width: 30, height: 40 };
    // At x=130, goober's right edge is at 100+30=130, so they touch but don't overlap
    expect(checkAABBCollision(goober, worm)).toBe(false);
  });

  it('handles goober jumping over worm (no y overlap)', () => {
    const gooberInAir = { x: 100, y: 50, width: 30, height: 40 };
    const wormOnGround = { x: 100, y: 100, width: 30, height: 40 };
    expect(checkAABBCollision(gooberInAir, wormOnGround)).toBe(false);
  });
});
