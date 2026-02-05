# AGENTS.md

This document serves as the **primary directive** for AI Agents and developers working on the **TTRPG Combat Manager**. Adherence to these guidelines is mandatory.

## 1. Core Philosophy & Workflow
- **Plan-Driven Execution**: Work strictly from `docs/plans/implementation_plan.md`. 
  - Execute stages sequentially and systematically.
  - Do not jump ahead.
  - Mark items as complete in the plan only when you are purely confident they are done.
  - Keep the plan current; if the reality changes, update the plan.
- **Documentation First**: 
  - Before implementing a new module or feature, gather all requirements and document them in `docs/`.
  - Maintain a progress log in the documentation folder.
- **Silent Execution**: Avoid chat output other than necessary tool calls. Focus on the work.

## 2. Tech Stack & Tools
- **Language**: TypeScript (Strict Mode required).
- **Framework**: React (Lite) + MobX (Lite).
- **Build**: esbuild.
- **Styling**: Vanilla CSS.
- **Testing**: Vitest (Business logic coverage > 90%).
- **Linting**: ESLint + Prettier. 
  - **Rule**: Use `npm run lint --fix` to resolve import sorting and formatting issues. Do not manually reorder imports.

## 3. Strict Architectural Standards
- **No Singletons**: 
  - **BANNED**: Global singleton instances (e.g., `export const store = new Store()`).
  - **REQUIRED**: Dependency Injection (DI). Instantiate dependencies at the root and pass them down (via props or Context).
  - **ACTION**: If you spot a singleton in preexisting code, report it as an issue immediately.
- **No `z-index`**: 
  - **BANNED**: Manual `z-index` values.
  - **REQUIRED**: Z-axis flow must be determined purely by DOM order and stacking contexts.
- **No Feature Flags**: Avoid flag-based design patterns unless specifically requested. Build the feature or don't.
- **Complexity**: Avoid unnecessary complexity. Calling out inefficient or over-engineered constructs is mandatory.

## 4. Coding Standards & Data Integrity

### Type Safety
- **Strict Contracts**: Define precise function contracts.
- **No Optionals**: Use optional parameters (`?`) only when absolutely necessary. Prefer explicit usage.
- **No Null/Undefined Initializers**: 
  - Avoid `| null` or `| undefined` union types for state.
  - Initialize values at construction (e.g., use empty arrays `[]` instead of `null`).
  - Keep types tight and avoid needless conditionality.

### Error Handling
- **Let It Fail**: 
  - **Do not** add fallback paths that hide underlying issues. 
  - **Do** emit errors with precise, descriptive reasons. 
  - We prefer a crash/error over a silent malformed state.

### File Management
- **File Size**: If a file or function is too large, **do not** trim whitespace to fix it. Extract code into separate, logical modules.

## 5. Domain Specifics (TTRPG Combat Manager)
- **Persistence**: State syncs to `localStorage` on every change.
- **Heroes vs Monsters**: Distinct lifecycles (Heroes persist, Monsters wipe).
- **Math Parser**: HP inputs support math Expressions (`-5+2`).
- **Tie Breaker Mode**: Exclusive UI state; locks down normal interactions.

## 6. QA & Quality
- **Enforce Quality**: Use the available tools (ESLint, TSC, Tests) rigourously.
- **Coverage**: If you touch business logic, run coverage. maintain 90%+.
