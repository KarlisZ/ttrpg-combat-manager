# TTRPG Combat Manager - Design Document

## 1. Executive Summary
The **TTRPG Combat Manager** is a lightweight, web-based tool designed to streamline combat tracking for Tabletop RPGs (specifically 5e-adjacent systems). It runs as a static site (Cloudflare Pages), emphasizing performance, offline-first reliability, and a clean, accessible user interface.

The application allows Game Masters (GMs) to track initiative, hit points, and status effects for both heroes and monsters. It features a robust history system (undo/redo), persistence (localStorage), and math-parser-enabled inputs.

## 2. Technical Architecture

### 2.1 Technology Stack
*   **Language**: TypeScript (Strict Mode)
*   **View Layer**: React (with `mobx-react-lite`)
*   **State Management**: MobX (Lite)
*   **Build Tool**: esbuild
*   **Styling**: Vanilla CSS (Variables, Semantic Classes) with PostCSS/Autoprefixer (via build pipeline context)
*   **Testing**: Vitest (Unit/Integration, >90% coverage for business logic)
*   **Deployment**: Static hosting (targets Cloudflare Pages)

### 2.2 Core Design Patterns
The application follows a strict **Dependency Injection (DI)** pattern to ensure testability and modularity. Singletons are explicitly banned.
*   **Root Store**: Dependencies are instantiated at the application root and passed down via React Context or Props.
*   **Services**: Stateless or state-encapsulating helpers (e.g., `HistoryManager`, `StorageService`) are injected into the Domain Stores.
*   **Domain Stores**: `CombatStore` and `UIStore` encapsulate business logic and view state, respectively.

### 2.3 Data Flow & Persistence
1.  **Reactive State**: The application state resides in `CombatStore`. It is observed by React components.
2.  **State Serialization**: The entire combat state is serializable to JSON.
3.  **Persistence Layer**: A MobX `reaction` observes state utility. On *any* change to serializable properties, the state is:
    *   Saved to `localStorage` (Key: `ttrpg_combat_state`).
    *   Pushed to the `HistoryManager` stack for undo/redo capabilities.
4.  **Component Rendering**: Components (`CombatTable`, `CommandBar`) render efficiently by observing specific slices of the store.

## 3. Data Models

### 3.1 CombatStore
The central hub for business logic.
*   **Properties**: `combatants`, `currentRound`, `activeCombatantId`, `initiativeDice`, `tieBreakerMode`, `activeCombatantId`.
*   **Responsibilities**:
    *   Managing the initiative queue.
    *   Handling turn/round transitions.
    *   Injecting new entities (Spawn).
    *   Resolving ties.

### 3.2 Combatant
Represents a single entity in combat.
*   **Properties**: `id`, `name`, `type` (Hero/Monster/NPC), `initiative` (Score), `initiativeModifier`, `hp` (Max/Current), `statuses`.
*   **Key Logic**:
    *   `hpLog`: Tracks HP changes per round.
    *   `statuses`: Stores active effects with duration.

### 3.3 Services
*   **HistoryManager<T>**: Generic stack implementation. Maintains past, current, and future states to support Undo/Redo.
*   **StorageService**: Abstracted wrapper for `localStorage` to allow safe fallbacks or alternative storage engines.

### 3.4 Utils
*   **MathParser**: A custom parser allowing users to type expressions like `-10+5` into HP inputs, which are evaluated safely.

## 4. Feature Specification

### 4.1 Combat Management (Command Bar)
*   **New Combat**: Clears monsters and resets round counter. Preserves Heroes (for campaign continuity).
*   **Turn Control**: "Previous Turn" / "Next Turn" buttons traverse the instruction queue.
*   **Undo/Redo**: Full state time-travel.
*   **Save/Load**: Export current state to `.json` or load a previous file.
*   **Options**: Configure Initiative Die (d4-d100) and specific behavior toggles.

### 4.2 The Combat Table
The main workspace is a responsive data table suitable for landscape mobile or desktop use.

**Columns:**
1.  **Controls**: Delete entity.
2.  **Order**: Computed turn order index.
3.  **Initiative**: The rolled score.
4.  **Name**: Editable text.
5.  **Current HP**: Read-only (calculated from Starting HP - Log).
6.  **Initiative Roll/Mod**: Input fields for base roll and modifier.
7.  **Starting HP**: Base HP value.
8.  **Round Columns**: Dynamic columns (Round 1, Round 2...). Inputs here accept math (e.g. `-5`).
    *   *Visual Logic*: Future round columns are de-emphasized.
    *   **Status Controls**: The input for the current round includes a **+** button on the right side.
        *   Clicking this opens the **Status Dropdown** to apply effects.
        *   There is no dedicated "Status Effects" column. Active statuses are displayed as pills within the relevant area or below the name.


### 4.3 Spawning System
A dedicated control panel below the table allows rapid entry.
*   **Heroes**: Single entry. Names auto-increment (Hero 1, Hero 2).
*   **Monsters**: Batch entry. User specifies Name, HP, Mod, and Count.
    *   *Auto-Roll*: The system rolls initiative for all spawned monsters (`d20 + mod`).
    *   *Conflict*: If new initiatives create ties, they are handled by the tie-breaker logic.

### 4.4 Conflict Resolution (Tie Breaker)
When multiple entities share an initiative count:
1.  **Detection**: The system flags the conflict.
2.  **Tie Breaker Mode**:
    *   Blocks normal table interaction.
    *   Highlights only the tied entities.
    *   **Manual Resolution**: The GM clicks rows in the desired turn order to resolve.
    *   **Auto Resolution**: Button available to randomly/sequentially resolve all ties instantly.

## 5. User Interface & Experience

### 5.1 Theming
*   **Palette**: Pastel, outdoorsy tones (Sage Green, Earthy Brown, Soft Beige) defined in CSS variables.
*   **Light/Dark Mode**: (Scope for future, currently single theme).
*   **Accessibility (a11y)**:
    *   Correct ARIA labels on all inputs.
    *   High contrast text.
    *   Focus management for keyboard navigation.

### 5.2 Responsive Design
*   **Primary View**: Desktop / Tablet Landscape.
*   **Mobile Warning**: Component `LandscapeWarning` suggests rotating the device for small screens, as the tabular data is dense.

## 6. Development Guidelines
*   **Formatting**: Prettier + ESLint.
*   **Imports**: Sorted via ESLint.
*   **React**: Function components only. Hooks for state access.
*   **MobX**: `makeAutoObservable` for stores. `observer` for components.

## 7. Future Roadmap (Optional)
*   PWA installation support.
*   Cloud sync via simple auth.
*   Custom theme editor.
