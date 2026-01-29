# DnD Combat Manager

A lightweight, robust, and accessible combat tracker for Dungeons & Dragons, built with modern web standards.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20Status-Pending-yellow)](https://pages.cloudflare.com/) <!-- Placeholder for future Cloudflare Pages deployment badge -->

![License](https://img.shields.io/badge/license-MIT-blue)
![Coverage](https://img.shields.io/badge/coverage-%3E90%25-brightgreen)

## 📖 Overview

The DnD Combat Manager is a single-page application designed to streamline combat encounters for Dungeon Masters. It focuses on speed, reliability, and accessibility. The application is built to run entirely in the browser (statics only) and persists state locally, ensuring you never lose your place in a battle.

## ✨ Features

- **Initiative Management**:
  - Automatic sorting by initiative score.
  - **Tie Breaker Mode**: Specialized UI for resolving initiative ties manually or automatically.
  - Supports custom initiative dice (d4 to d100).

- **Robust Tracking**:
  - **Health Tracking**: Inputs support math expressions (e.g., `-5+2` or `15/2`), making damage calculations instant.
  - **Status Effects**: Track conditions with durations (rounds, minutes, "until next turn").
  - **Round & Turn History**: Full history stack allows you to navigate back and forth through rounds and turns without losing data.

- **Entity Management**:
  - **Heroes**: Persist between combat encounters.
  - **Monsters**: Quick spawn independent instances with auto-rolled initiative.

- **User Experience**:
  - **Mobile Friendly**: optimized for landscape view on mobile devices.
  - **Offline Capable**: State is saved to `localStorage` on every change.
  - **Accessible**: Built with semantic HTML and high accessibility standards.
  - **Theming**: Pleasant "Outdoor Pastel" theme with vanilla CSS variables.

## 🛠️ Tech Stack

This project uses a strict, lightweight, and modern stack to ensure performance and maintainability:

- **Language**: TypeScript (Strict Mode)
- **Framework**: React (Lite) + MobX (Lite) for state management
- **Build Tool**: esbuild
- **Styling**: Vanilla CSS (No large frameworks, strict CSS variables)
- **Testing**: Vitest (Business logic coverage > 90%)
- **Linting**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites

- **Dev Container**: This project is configured to run inside a VS Code Dev Container. This ensures all dependencies (Node, NPM, Git) are isolated and version-controlled.
- **Node.js**: If running locally without a container, ensure you have the latest LTS version of Node.js installed.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/dnd-combat-manager.git
    cd dnd-combat-manager
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    ```bash
    cp .env.example .env
    ```

### Available Scripts

- **`npm start`**: Runs the development server.
- **`npm run build`**: Builds the production bundle to the `dist` folder via esbuild.
- **`npm run test`**: Runs the Vitest test suite.
- **`npm run test:coverage`**: Runs tests with coverage reporting.
- **`npm run lint`**: Runs ESLint to check for code quality issues.
- **`npm run lint --fix`**: Automatically fixes formatting and simple linting errors.

## 🤝 Contributing

Contributions are welcome! Please adhere to the `AGENTS.md` guidelines if you are an AI agent or aiming for high consistency with the existing codebase.

1.  **Strict Typing**: No `any`, minimize `optional` parameters.
2.  **No Singletons**: Use Dependency Injection.
3.  **Tests Required**: Core logic must maintain high test coverage.

## 📄 License

This project is open source and available under the MIT License.

## ❤️ Credits

Created by **Sigfa**.

If you find this tool useful, consider [Buying Me a Coffee](#). <!-- Placeholder for PayPal/Ko-fi link -->
