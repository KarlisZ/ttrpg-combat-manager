# TTRPG Combat Manager

A professional, high-performance combat tracker for Tabletop RPGs.

[![Web](https://img.shields.io/badge/Deploy%20Status-Pending-yellow)](https://pages.cloudflare.com/)
![License](https://img.shields.io/badge/license-MIT-blue)
![Coverage](https://img.shields.io/badge/coverage-%3E90%25-brightgreen)

## Features

- **Entity Management**:
  - **Heroes**: Create and persist hero characters between encounters.
  - **Monsters**: Quickly spawn monsters for a specific encounter.
- **Initiative Management**:
  - **Automatic Sorting**: Entities are sorted by initiative score immediately.
  - **Auto-Roll**: Automatically roll initiative for all monsters or selected groups.
  - **Tie Breakers**: Explicit tie-breaker values ensure deterministic ordering without manipulating the raw initiative score.
- **Combat Tracking**:
  - **Health Tracking**: Input math expressions (e.g., `-5+2`) for rapid damage/healing calculation.
  - **Status Effects**: Track conditions and durations.
  - **History Stack**: Undo/Redo support for round and turn transitions to correct mistakes without data loss.
- **System**:
  - **Local Persistence**: State is saved to `localStorage` immediately upon change.
  - **Evaluation**: Inputs support complex mathematical expressions.

## Tech Stack

- **Language**: TypeScript (Strict)
- **State**: React + MobX Lite
- **Build**: esbuild
- **Test**: Vitest

## Getting Started

### Installation

1.  Clone the repository and navigate to the directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment:
    ```bash
    cp .env.example .env
    ```

### CLI Commands

- `npm run dev` - Start development server.
- `npm run build` - Production build.
- `npm test` - Run test suite.
- `npm run lint` - Run linter.

## Contributing

See `AGENTS.md` for architectural guidelines.
- **Strict Typing**: Required.
- **No Singletons**: Use Dependency Injection.
- **Coverage**: Maintain >90% test coverage.

## License

ISC License.
