# Contributing to SeedHeart

Thank you for contributing. This document defines the **mandatory** Git workflow, code standards, and PR process. Every contributor — including the original author — must follow these rules.

---

## Table of Contents

1. [Branching Strategy](#1-branching-strategy)
2. [Commit Conventions](#2-commit-conventions)
3. [The Development Loop](#3-the-development-loop)
4. [Testing Requirements](#4-testing-requirements)
5. [Pull Request Process](#5-pull-request-process)
6. [Code Style](#6-code-style)
7. [Environment Setup for Contributors](#7-environment-setup-for-contributors)

---

## 1. Branching Strategy

```
main
 └── feature/phase-1-scaffolding      ← Phase branch (off main)
      └── (commits per task)
 └── feature/phase-2-3d-engine
 └── feature/phase-3-data-model
 └── hotfix/fix-raycaster-memory-leak  ← Hotfixes branch from main directly
```

| Branch type | Naming | Base | Merges into |
|---|---|---|---|
| Phase feature | `feature/phase-N-short-name` | `main` | `main` (via PR) |
| Single feature | `feature/description-in-kebab` | `main` | `main` (via PR) |
| Bug fix | `fix/description-in-kebab` | `main` | `main` (via PR) |
| Hotfix (prod) | `hotfix/description` | `main` | `main` (via PR) |

**Rules:**
- `main` is always releasable. No direct pushes. Ever.
- One phase = one feature branch. Create the branch before writing any code for that phase.
- Never start a new phase branch until the previous phase's PR is merged.

```bash
# Start a new phase
git checkout main
git pull origin main
git checkout -b feature/phase-2-3d-engine
```

---

## 2. Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(optional scope): <short description>

[optional body]

[optional footer: BREAKING CHANGE or issue refs]
```

### Allowed types

| Type | When to use |
|---|---|
| `feat` | New feature or visible behaviour |
| `fix` | Bug fix |
| `test` | Adding or updating tests only |
| `refactor` | Code change with no behaviour change |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |
| `docs` | Documentation only |
| `chore` | Build scripts, config, tooling |
| `ci` | CI/CD pipeline changes |

### Examples

```bash
git commit -m "feat(engine): add procedural branch geometry with vertex deformation"
git commit -m "fix(raycaster): prevent stale leaf references after tree rebuild"
git commit -m "test(TreeParser): add unit tests for malformed AI JSON responses"
git commit -m "feat(ai): integrate LM Studio streaming completions"
```

**Keep commits atomic.** One logical change per commit. If you find yourself using "and" in the message, split the commit.

---

## 3. The Development Loop

For every task in `TODO.md`:

```
1. Mark task in-progress in TODO.md
   │
2. Write the tests FIRST (TDD)
   │  → unit test for the module
   │  → smoke test for the feature in isolation
   │
3. Implement the code until tests pass
   │
4. Commit: "test: ..." then "feat: ..."  (or combined if trivial)
   │
5. Push the branch
   │  git push origin feature/phase-N-short-name
   │
6. Mark task complete in TODO.md
```

Never push code with failing tests. The CI pipeline will block the PR if tests fail.

---

## 4. Testing Requirements

**No task is complete until its tests pass.** There are three levels:

### Unit Tests (Vitest)

- Location: `tests/unit/`
- Mirror the `src/` directory structure: `src/ai/TreeParser.ts` → `tests/unit/ai/TreeParser.test.ts`
- Cover: pure functions, data transformations, edge cases, error paths
- Run: `npm run test`

### Smoke Tests

- Lightweight integration checks that a module initialises and produces valid output without crashing
- Can be Vitest tests that instantiate the module with minimal mocks
- Must pass before pushing a task branch

### E2E Tests (Playwright)

- Location: `tests/e2e/`
- Required for any task that touches a user-facing interaction flow
- Run: `npm run test:e2e`
- Cover: seed input → tree generation → node click → panel display → camera reset

### Coverage Threshold

The CI enforcer requires:
- Statements: ≥ 80%
- Branches: ≥ 75%
- Functions: ≥ 80%

```bash
npm run test:coverage   # generates coverage report in coverage/
```

---

## 5. Pull Request Process

### Opening a PR

1. All commits pushed to the feature branch.
2. `npm run lint` passes with zero errors.
3. `npm run test` passes (all unit + smoke tests green).
4. `npm run test:e2e` passes (if applicable to the phase).
5. `TODO.md` is updated with completed checkboxes for all tasks in this phase.

### PR Description Template

```markdown
## Summary
<!-- What does this PR do? One paragraph. -->

## Phase / Tasks Completed
<!-- Link to the TODO.md phase -->
- [x] Task 1: ...
- [x] Task 2: ...

## Testing
- Unit tests: ✅ all passing
- Smoke tests: ✅ all passing
- E2E tests: ✅ / N/A

## Screenshots / Video
<!-- Required for any UI or 3D rendering change -->

## Breaking Changes
<!-- None / describe any -->
```

### Review & Merge

- At minimum one approval required before merge (self-review for solo projects — use the PR description to force yourself to articulate the change clearly).
- Merge strategy: **Squash and merge** for feature branches, **Merge commit** for phase branches (to preserve phase history).
- Delete the feature branch after merge.

---

## 6. Code Style

The project enforces style automatically via ESLint + Prettier. Run `npm run lint:fix` to auto-fix.

Key rules:
- TypeScript strict mode (`"strict": true`) — no `any`, no implicit `any`
- No `console.log` in committed code (use the `logger` utility)
- React components: functional only, no class components
- Three.js objects: always dispose geometry and materials when removing from scene
- No magic numbers — define named constants in `src/constants.ts`
- File names: `PascalCase` for components and classes, `camelCase` for utilities

---

## 7. Environment Setup for Contributors

```bash
# Fork and clone
git clone https://github.com/your-username/seedheart.git
cd seedheart

# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Copy env
cp .env.example .env
# Edit .env with your LM Studio URL and model ID

# Verify everything works
npm run dev       # dev server at localhost:5173
npm run test      # unit tests
npm run test:e2e  # E2E (requires dev server running)
```

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Three.js snippets
- Vitest Explorer
