# goobergame

Goober Game! An endless runner built with Phaser 3 and Vite.

## Development

### Install Dependencies

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

The game will be available at `http://localhost:8080` (or the next available port).

### Run Tests

Tests are written with [Vitest](https://vitest.dev/) and cover the core game logic in `src/logic/scoring.js`. Run tests with:

```bash
npm test
```

To run tests in watch mode (re-run on file changes):

```bash
npm test -- --watch
```

## Project Structure

- `src/main.js` — Phaser game config and initialization
- `src/logic/scoring.js` — Pure game logic functions (score, game speed, worm spawning, collision detection)
- `src/objects/` — Phaser game objects (Goober player, Worm enemies)
- `src/scenes/` — Phaser scenes (BootScene, GameScene, GameOverScene)
- `tests/` — Unit tests for game logic
- `vite/` — Vite build configuration for dev and production
