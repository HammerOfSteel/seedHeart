# SeedHeart — Implementation TODO

> **Workflow Rules (read before touching any task)**
> - Each Phase = a new feature branch off `main` (`feature/phase-N-name`)
> - Each Task = one or more atomic commits on that branch
> - Push after every completed task
> - No task is complete without its tests passing
> - End of Phase = PR → review → merge into `main` → delete branch
>
> See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the full Git & testing workflow.

---

## Phase 1: Project Scaffolding & Core Setup
- **Branch:** `feature/phase-1-scaffolding`

- [ ] **Task 1: Initialise Vite + React + TypeScript project**
  - [ ] Write smoke test: verify `npm run build` produces a `dist/` folder
  - [ ] Run `npm create vite@latest . -- --template react-ts`
  - [ ] Configure `tsconfig.json` with `"strict": true` and path aliases (`@/` → `src/`)
  - [ ] Commit: `"chore: initialise Vite React TypeScript project"`
  - [ ] Verify build smoke test passes
  - [ ] Push to branch

- [ ] **Task 2: Configure Tailwind CSS**
  - [ ] Write smoke test: verify Tailwind utility classes compile and appear in `dist/`
  - [ ] Install and configure `tailwindcss`, `postcss`, `autoprefixer`
  - [ ] Add Tailwind directives to `src/index.css`
  - [ ] Apply a test class to `App.tsx` and verify visually in dev server
  - [ ] Commit: `"chore: add and configure Tailwind CSS"`
  - [ ] Run smoke test
  - [ ] Push to branch

- [ ] **Task 3: Configure ESLint, Prettier, and lint-staged**
  - [ ] Write smoke test: verify `npm run lint` passes on the starter code
  - [ ] Install `eslint`, `eslint-plugin-react`, `@typescript-eslint/*`, `prettier`, `lint-staged`, `husky`
  - [ ] Create `.eslintrc.cjs`, `.prettierrc`, `.lintstagedrc`
  - [ ] Set up Husky pre-commit hook to run `lint-staged`
  - [ ] Commit: `"chore: add ESLint, Prettier, and lint-staged pre-commit hook"`
  - [ ] Run lint smoke test
  - [ ] Push to branch

- [ ] **Task 4: Configure Vitest unit testing**
  - [ ] Write a trivial unit test (`sum.test.ts`) to validate the setup
  - [ ] Install `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `jsdom`
  - [ ] Configure `vitest.config.ts` with jsdom environment and coverage thresholds (80% statements, 75% branches)
  - [ ] Add `npm run test` and `npm run test:coverage` scripts
  - [ ] Run unit test — confirm passes
  - [ ] Commit: `"chore: configure Vitest with coverage thresholds"`
  - [ ] Push to branch

- [ ] **Task 5: Configure Playwright E2E testing**
  - [ ] Write a smoke E2E test: page loads, title is "SeedHeart"
  - [ ] Install `@playwright/test` and run `npx playwright install`
  - [ ] Create `playwright.config.ts`
  - [ ] Add `npm run test:e2e` script
  - [ ] Run E2E smoke test — confirm passes
  - [ ] Commit: `"chore: configure Playwright for E2E tests"`
  - [ ] Push to branch

- [ ] **Task 6: Create project folder structure and constants**
  - [ ] Write unit test: `src/constants.ts` exports all required constants with correct types
  - [ ] Create `src/` directory structure: `ai/`, `components/`, `engine/`, `graph/`, `store/`
  - [ ] Create `src/constants.ts` with tree config, camera defaults, palette, API defaults
  - [ ] Create `.env.example` with all required variables
  - [ ] Commit: `"chore: establish src folder structure and constants"`
  - [ ] Run all tests — confirm all passing
  - [ ] Push to branch

- [ ] **Phase 1 Wrap-up:**
  - [ ] Ensure `npm run lint`, `npm run test`, `npm run test:e2e` all pass
  - [ ] Confirm `dist/` builds cleanly with `npm run build`
  - [ ] Merge `feature/phase-1-scaffolding` into `main` via PR

---

## Phase 2: Engine Foundation & Renderer Framework
- **Branch:** `feature/phase-2-engine-foundation`

- [ ] **Task 1: IRenderer interface and RendererManager**
  - [ ] Write unit tests for `RendererManager`: verify `switchTo` calls `dispose` on the old renderer before mounting the new one; verify it calls `render` if a `MemeTree` is already in the store
  - [ ] Install `three` and `@types/three`
  - [ ] Define `IRenderer` interface in `src/engine/IRenderer.ts`
  - [ ] Implement `src/engine/RendererManager.ts` with `switchTo`, `getCurrentRenderer`, and 300ms fade transition
  - [ ] Commit: `"feat(engine): add IRenderer interface and RendererManager strategy pattern"`
  - [ ] Push to branch

- [ ] **Task 2: Shared Canvas/WebGL bootstrap**
  - [ ] Write unit tests: verify that mounting a mock `IRenderer` creates a `<canvas>` element and that `dispose` removes it
  - [ ] Implement shared `<div id="renderer-container">` in `App.tsx` that `RendererManager` mounts into
  - [ ] Implement CSS fade-in/fade-out for mode transitions
  - [ ] Smoke test: blank canvas mounts and fills viewport
  - [ ] Commit: `"feat(engine): add renderer container and CSS transition system"`
  - [ ] Push to branch

- [ ] **Task 3: Mode-agnostic InteractionSystem**
  - [ ] Write unit tests: verify pointer-event dispatching to store for both WebGL raycaster and Canvas 2D hit-test paths; verify cleanup on `disable()`
  - [ ] Implement `src/engine/InteractionSystem.ts` with two strategies: `RaycasterStrategy` (Three.js) and `Canvas2DStrategy` (bounding-circle hit test)
  - [ ] Commit: `"feat(engine): add InteractionSystem with WebGL raycaster and Canvas 2D strategies"`
  - [ ] Push to branch

- [ ] **Task 4: CameraController (3D modes only)**
  - [ ] Write unit tests for `CameraController`: verify `focusOn` tweens to target; verify `reset` restores initial position; verify `update` calls `OrbitControls.update`
  - [ ] Install `@tweenjs/tween.js`
  - [ ] Implement `src/engine/CameraController.ts`
  - [ ] Commit: `"feat(engine): add CameraController with TWEEN-based focus and reset"`
  - [ ] Push to branch

- [ ] **Phase 2 Wrap-up:**
  - [ ] All unit tests pass
  - [ ] `RendererManager.switchTo` swaps between two stub renderers without error in dev server
  - [ ] Merge `feature/phase-2-engine-foundation` into `main` via PR

---

## Phase 3: Data Model & Graph Structure
- **Branch:** `feature/phase-3-data-model`

- [ ] **Task 1: TypeScript interfaces and types**
  - [ ] Write unit tests: validate that `Meme`, `MemeTree`, `VisualNode`, `IRenderer`, and `VisualizationMode` types enforce correct shapes
  - [ ] Implement `src/graph/MemeTree.ts` with all interfaces
  - [ ] Add `VisualizationMode` union type: `'mycelium' | 'crystal' | 'ink' | 'circuit' | 'mandala'`
  - [ ] Commit: `"feat(graph): add core TypeScript types including VisualizationMode"`
  - [ ] Push to branch

- [ ] **Task 2: Color palette module**
  - [ ] Write unit tests for `ColorPalette`: verify `getRootColor` is stable for the same index; `getDerivedColor` shifts lightness correctly; all five viz modes can consume the same palette
  - [ ] Implement `src/graph/ColorPalette.ts`
  - [ ] Commit: `"feat(graph): add shared ColorPalette used by all renderers"`
  - [ ] Push to branch

- [ ] **Task 3: Tree layout algorithm**
  - [ ] Write unit tests: polar layout for 2D modes produces valid `{angle, radius}` per node; 3D layout produces valid `{x, y, z}` per node; no two same-depth siblings overlap
  - [ ] Implement `src/graph/TreeLayout.ts` with both `computePolarLayout` (2D) and `compute3DLayout` (3D Cartesian) exports
  - [ ] Commit: `"feat(graph): add TreeLayout with polar and 3D Cartesian layout modes"`
  - [ ] Push to branch

- [ ] **Task 4: Zustand store — add visualization slice**
  - [ ] Write unit tests for each store action
  - [ ] Implement `src/store/index.ts` with all slices including `activeMode: VisualizationMode` (default: `'mycelium'`) and `setActiveMode`
  - [ ] Enable Zustand devtools middleware
  - [ ] Smoke test: Redux DevTools extension shows store in browser; switching mode updates store
  - [ ] Commit: `"feat(store): add Zustand store with all slices including activeMode"`
  - [ ] Push to branch

- [ ] **Phase 3 Wrap-up:**
  - [ ] All new unit tests pass; coverage thresholds met
  - [ ] Merge `feature/phase-3-data-model` into `main` via PR

---

## Phase 4: 3D Visualization Modes — Mycelium & Crystal
- **Branch:** `feature/phase-4-3d-renderers`

- [ ] **Task 1: MyceliumRenderer — scene, nodes, and lighting**
  - [ ] Write unit tests: verify scene contains correct light types; verify node mesh count matches `MemeTree` node count; verify `dispose` clears all objects
  - [ ] Implement `src/engine/renderers/MyceliumRenderer.ts`: Three.js scene, `MeshPhysicalMaterial` spheres with transmission, `FogExp2`, breathing oscillation in animation loop
  - [ ] Smoke test: a fixture `MemeTree` renders as floating glowing spheres in a dark void
  - [ ] Commit: `"feat(renderer): add MyceliumRenderer scene, nodes, and lighting"`
  - [ ] Push to branch

- [ ] **Task 2: MyceliumRenderer — bezier tendril connections and particle streams**
  - [ ] Write unit tests: verify `TubeGeometry` count matches connection count; verify particle positions update each frame
  - [ ] Implement `QuadraticBezierCurve3` connections as `TubeGeometry` meshes with animated UV scroll
  - [ ] Implement particle stream `Points` system: one `BufferGeometry` with position `Float32Array` updated per frame
  - [ ] Smoke test: particles visibly travel from parent to child along each tendril
  - [ ] Commit: `"feat(renderer): add Mycelium bezier tendrils and particle stream system"`
  - [ ] Push to branch

- [ ] **Task 3: MyceliumRenderer — hover ripple and selection states**
  - [ ] Write integration tests: `onHover` boosts emissive intensity on correct node and its immediate neighbours; `onSelect` triggers ripple propagation BFS
  - [ ] Implement emissive boost on hover; implement BFS ripple propagation via `setTimeout` chains on select
  - [ ] E2E test: hover a node → glow brightens; click → ripple travels through the graph
  - [ ] Commit: `"feat(renderer): add Mycelium hover glow and selection ripple propagation"`
  - [ ] Push to branch

- [ ] **Task 4: CrystalRenderer — iridescent nodes and staggered crystallisation**
  - [ ] Write unit tests: verify `OctahedronGeometry` count matches node count; verify nodes start at `scale(0)` and reach `scale(1)` after animation; verify geometry disposed on rebuild
  - [ ] Implement `src/engine/renderers/CrystalRenderer.ts`: Three.js scene, `MeshPhysicalMaterial` with `iridescence: 1.0`, BFS-ordered staggered scale tween on `render()`
  - [ ] Confirm Three.js version pinned to r152+ for iridescence support
  - [ ] Smoke test: tree crystallises into existence with a satisfying staggered grow animation
  - [ ] Commit: `"feat(renderer): add CrystalRenderer with iridescent nodes and crystallisation animation"`
  - [ ] Push to branch

- [ ] **Task 5: CrystalRenderer — spire connections, orbiting lights, and sparkle on hover**
  - [ ] Write unit tests: verify `ConeGeometry` count matches edge count; verify orbiting lights rotate per frame; verify sparkle particle burst is created on hover and disposed after 0.8s
  - [ ] Implement `ConeGeometry` spires oriented along parent→child direction vectors
  - [ ] Implement three orbiting `PointLight` instances (warm white, cold blue, faint gold)
  - [ ] Implement 20-particle sparkle burst on hover using a custom fade shader
  - [ ] E2E test: hover crystal node → sparkle burst; orbit camera → light play visibly shifts
  - [ ] Commit: `"feat(renderer): add Crystal spire connections, orbiting lights, and sparkle hover"`
  - [ ] Push to branch

- [ ] **Phase 4 Wrap-up:**
  - [ ] Both 3D renderers fully functional with interactions
  - [ ] All unit and E2E tests pass
  - [ ] Merge `feature/phase-4-3d-renderers` into `main` via PR

---

## Phase 5: 2D Visualization Modes — Ink, Circuit & Mandala
- **Branch:** `feature/phase-5-2d-renderers`

- [ ] **Task 1: InkRenderer — parchment background and node bloom**
  - [ ] Write unit tests: verify parchment texture is generated on `OffscreenCanvas` without loading external assets; verify node radius reaches target after bloom animation completes; verify stored `{x, y, radius}` positions are correct for hit-testing
  - [ ] Implement `src/engine/renderers/InkRenderer.ts`: dual-canvas stack (base + overlay), noise-generated parchment, ink-drop bloom with feathered edge (`arc` strokes at decreasing alpha)
  - [ ] Smoke test: nodes bloom onto parchment in BFS order with realistic ink spread
  - [ ] Commit: `"feat(renderer): add InkRenderer with parchment texture and ink-drop bloom"`
  - [ ] Push to branch

- [ ] **Task 2: InkRenderer — watercolour connections and character-by-character labels**
  - [ ] Write unit tests: verify `quadraticCurveTo` path segments are computed correctly; verify label characters animate in at the correct per-character delay
  - [ ] Implement watercolour wash connections (variable-width `quadraticCurveTo` with two-pass feathering)
  - [ ] Implement character-by-character label draw with `setTimeout` after node bloom
  - [ ] E2E test: full tree renders legibly on parchment with visible handwriting animation
  - [ ] Commit: `"feat(renderer): add Ink watercolour connections and animated label writing"`
  - [ ] Push to branch

- [ ] **Task 3: CircuitRenderer — hex grid, hexagonal nodes, and routing traces**
  - [ ] Write unit tests: verify hex grid is precomputed to `OffscreenCanvas` once; verify orthogonal routing paths avoid node bounding boxes; verify trace `Point[]` arrays are stored correctly
  - [ ] Implement `src/engine/renderers/CircuitRenderer.ts`: hex grid background, hexagonal node geometry, A*-lite orthogonal trace routing
  - [ ] Smoke test: nodes render as neon hexagons with clean circuit routing between them
  - [ ] Commit: `"feat(renderer): add CircuitRenderer with hex nodes and orthogonal trace routing"`
  - [ ] Push to branch

- [ ] **Task 4: CircuitRenderer — pulse animation and corrupted-text hover**
  - [ ] Write unit tests: verify pulse `t` progresses each frame; verify "corrupted text" counter decrements and resolves correctly; verify scanline overlay is composited via CSS (not Canvas draw)
  - [ ] Implement travelling pulse dots (`t ∈ [0,1]` interpolated along stored path)
  - [ ] Implement corrupted-text hover effect (random char substitution for 3 frames)
  - [ ] Implement CSS scanline overlay (`repeating-linear-gradient` `<div>` with `mix-blend-mode: multiply`)
  - [ ] E2E test: pulses visibly travel traces; hover a node → text briefly corrupts then resolves
  - [ ] Commit: `"feat(renderer): add Circuit pulse animation and hover corruption effect"`
  - [ ] Push to branch

- [ ] **Task 5: MandalaRenderer — concentric ring layout, arcs, and ring rotation**
  - [ ] Write unit tests: verify canonical angles are evenly distributed per ring; verify per-frame rotation correctly offsets angles; verify hit-test back-calculates canonical angle from current rotation offset
  - [ ] Implement `src/engine/renderers/MandalaRenderer.ts`: concentric ring layout, cubic bezier arc connections, ring rotation at different `ω` values, node pulsing via `sin(time + phase)`
  - [ ] Smoke test: mandala slowly breathes and rotates; nodes are evenly distributed across rings
  - [ ] Commit: `"feat(renderer): add MandalaRenderer with rotating concentric rings and arc connections"`
  - [ ] Push to branch

- [ ] **Task 6: MandalaRenderer — sub-mandala bloom on node selection**
  - [ ] Write unit tests: verify sub-mandala scale tweens from 0 to 1 over 600ms; verify main mandala dims to 30% opacity on select; verify "return" collapses sub-mandala with reverse animation
  - [ ] Implement sub-mandala bloom using `easeOutBack` scale tween
  - [ ] Implement Fibonacci spiral background (precomputed on `OffscreenCanvas`)
  - [ ] E2E test: click a ring-1 node → sub-mandala blooms from that point; press Escape → sub-mandala collapses
  - [ ] Commit: `"feat(renderer): add Mandala sub-tree bloom and Fibonacci spiral background"`
  - [ ] Push to branch

- [ ] **Phase 5 Wrap-up:**
  - [ ] All three 2D renderers fully functional with all interactions
  - [ ] All unit and E2E tests pass
  - [ ] Merge `feature/phase-5-2d-renderers` into `main` via PR

---

## Phase 6: React UI Layer
- **Branch:** `feature/phase-6-ui`

- [ ] **Task 1: SeedInput component**
  - [ ] Write unit tests: renders textarea and button; button disabled during generation; calls `onSubmit` with trimmed value
  - [ ] Implement `src/components/SeedInput.tsx` with glass-morphism styling
  - [ ] Wire to store: `setSeed`, `setGenerating`
  - [ ] Commit: `"feat(ui): add SeedInput component"`
  - [ ] Push to branch

- [ ] **Task 2: ModePicker component**
  - [ ] Write unit tests: renders 5 buttons; active mode is highlighted; clicking a mode calls `store.setActiveMode` and `RendererManager.switchTo`; buttons have correct aria-labels
  - [ ] Implement `src/components/ModePicker.tsx` — 5 icon/thumbnail buttons, one per mode
  - [ ] Wire to `RendererManager` and store
  - [ ] E2E test: click each mode button in sequence; verify canvas is replaced and tree re-renders in new style
  - [ ] Commit: `"feat(ui): add ModePicker component for switching visualization modes"`
  - [ ] Push to branch

- [ ] **Task 3: NodeDetailPanel component**
  - [ ] Write unit tests: hidden when `selectedNodeId` is null; shows correct content; copy triggers clipboard; regenerate calls handler
  - [ ] Implement `src/components/NodeDetailPanel.tsx` with slide-in transition
  - [ ] Clipboard copy: modern API + `execCommand` fallback
  - [ ] Commit: `"feat(ui): add NodeDetailPanel with copy and regenerate"`
  - [ ] Push to branch

- [ ] **Task 4: Toolbar, LoadingOverlay, and ToastNotification**
  - [ ] Write unit tests for each component
  - [ ] Implement `Toolbar.tsx` (title, status, zoom-out — only shown for 3D modes, hidden for 2D)
  - [ ] Implement `LoadingOverlay.tsx` (animated "GROWING..." text)
  - [ ] Implement `ToastNotification.tsx` (auto-dismiss timer)
  - [ ] Commit: `"feat(ui): add Toolbar, LoadingOverlay, and ToastNotification"`
  - [ ] Push to branch

- [ ] **Task 5: Compose App.tsx**
  - [ ] Write E2E test: full user flow — type seed, grow, tree renders, switch mode, click node, copy, close panel
  - [ ] Compose `App.tsx` with all components over the renderer container
  - [ ] Commit: `"feat(ui): compose App.tsx with all UI components"`
  - [ ] Push to branch

- [ ] **Phase 6 Wrap-up:**
  - [ ] All component unit tests pass; E2E user flow passes
  - [ ] Merge `feature/phase-6-ui` into `main` via PR

---

## Phase 7: LM Studio AI Integration
- **Branch:** `feature/phase-7-ai-integration`

- [ ] **Task 1: LMStudioClient**
  - [ ] Write unit tests for `LMStudioClient`: mock `fetch`; test successful response, 404 error, network error, malformed response
  - [ ] Implement `src/ai/LMStudioClient.ts` with `generateTree` and `ping` methods
  - [ ] Use `AbortController` for request timeout
  - [ ] Commit: `"feat(ai): add LMStudioClient with error handling and timeout"`
  - [ ] Push to branch

- [ ] **Task 2: PromptTemplates**
  - [ ] Write unit tests: verify `buildSystemPrompt()` and `buildUserPrompt(seed)` return strings containing required schema markers
  - [ ] Implement `src/ai/PromptTemplates.ts`
  - [ ] Commit: `"feat(ai): add PromptTemplates for structured JSON output"`
  - [ ] Push to branch

- [ ] **Task 3: TreeParser**
  - [ ] Write unit tests for `TreeParser`: valid JSON → MemeTree; missing fields → ParseError; depth > 3 → trimmed; breadth > 8 → trimmed; non-JSON string → ParseError
  - [ ] Implement `src/ai/TreeParser.ts` with strict validation
  - [ ] Commit: `"feat(ai): add TreeParser with schema validation and depth/breadth clamping"`
  - [ ] Push to branch

- [ ] **Task 4: Wire AI flow to SeedInput and TreeBuilder**
  - [ ] Write integration test: `SeedInput` submit → `LMStudioClient.generateTree` (mocked) → `store.setMemeTree` → `TreeBuilder.build` called
  - [ ] Implement the async flow in a `useGenerateTree` hook
  - [ ] Handle and display errors via `store.showToast`
  - [ ] Smoke test: with LM Studio running, enter a seed and confirm a tree generates
  - [ ] E2E test: mock AI endpoint, submit seed, verify tree geometry mounts in DOM canvas
  - [ ] Commit: `"feat(ai): wire LMStudioClient to SeedInput and TreeBuilder"`
  - [ ] Push to branch

- [ ] **Task 5: Leaf content regeneration**
  - [ ] Write unit test for `regenerateLeaf`: calls `LMStudioClient` with the leaf's meme path; updates only that node's content in store
  - [ ] Implement `regenerateLeaf` action in store and wire to `NodeDetailPanel` regenerate button
  - [ ] Animate the leaf pop effect on regeneration
  - [ ] Commit: `"feat(ai): add per-leaf content regeneration"`
  - [ ] Push to branch

- [ ] **Phase 6 Wrap-up:**
  - [ ] Full flow works end-to-end with a real LM Studio instance
  - [ ] All error states handled gracefully (toast notifications shown)
  - [ ] All unit and E2E tests pass
  - [ ] Merge `feature/phase-6-ai-integration` into `main` via PR

---

## Phase 8: Polish, Performance & Accessibility
- **Branch:** `feature/phase-8-polish`

- [ ] **Task 1: 3D renderer InstancedMesh optimisation**
  - [ ] Write unit test: verify `MyceliumRenderer` and `CrystalRenderer` use `THREE.InstancedMesh` for same-depth node sets; verify instance count matches node count at that depth
  - [ ] Refactor both 3D renderers to share a single `InstancedMesh` per depth level
  - [ ] Confirm `InteractionSystem` raycasting still works against instanced meshes
  - [ ] Commit: `"perf(renderer): replace per-node meshes with InstancedMesh in 3D renderers"`
  - [ ] Push to branch

- [ ] **Task 2: Renderer disposal registry**
  - [ ] Write unit test: verify all geometries and materials are disposed when any renderer's `dispose()` is called; no `WebGLRenderer` memory leaks; no leaked Canvas 2D contexts
  - [ ] Add a `DisposalRegistry` utility class shared by all five renderers
  - [ ] Commit: `"fix(engine): add DisposalRegistry to prevent geometry and context leaks"`
  - [ ] Push to branch

- [ ] **Task 3: Mobile touch controls**
  - [ ] Write E2E test: simulate touch events on canvas; verify orbit and pinch-zoom work
  - [ ] Enable `OrbitControls` touch support; reduce pixel ratio on mobile
  - [ ] Conditionally disable shadows on low-end devices
  - [ ] Commit: `"feat(engine): add mobile touch support and adaptive quality"`
  - [ ] Push to branch

- [ ] **Task 4: Accessibility — keyboard navigation**
  - [ ] Write unit tests: tab-focusable seed input; Enter triggers Grow; Escape closes detail panel
  - [ ] Add keyboard navigation for panel and toolbar actions
  - [ ] Add `aria-live` region for toast notifications
  - [ ] Commit: `"feat(ui): add keyboard navigation and aria-live for accessibility"`
  - [ ] Push to branch

- [ ] **Task 5: PWA manifest and offline shell**
  - [ ] Write smoke test: `dist/` contains `manifest.webmanifest`; app loads offline (service worker intercepts)
  - [ ] Add `vite-plugin-pwa`; configure manifest with app name, icons, and theme colour
  - [ ] Register service worker for offline asset caching
  - [ ] Commit: `"feat: add PWA manifest and offline service worker"`
  - [ ] Push to branch

- [ ] **Phase 7 Wrap-up:**
  - [ ] Lighthouse score ≥ 90 for Performance and Accessibility
  - [ ] All tests pass
  - [ ] Merge `feature/phase-8-polish` into `main` via PR

---

## Phase 9: Review & Expand
- **Branch:** `feature/phase-9-review-and-expand`

- [ ] **Task 1: Full codebase review and refactor session**
  - [ ] Read every file in `src/` with fresh eyes; note any inconsistencies, dead code, or unclear naming
  - [ ] Write tests for any discovered untested paths
  - [ ] Refactor identified code smells; keep each refactor as a separate commit
  - [ ] Commit: `"refactor: codebase review clean-up pass"`
  - [ ] Push to branch

- [ ] **Task 2: Test coverage audit and gap patching**
  - [ ] Run `npm run test:coverage`; export HTML coverage report
  - [ ] Identify all files below 80% statement coverage
  - [ ] Write targeted tests for each coverage gap
  - [ ] Re-run coverage — confirm all thresholds met
  - [ ] Commit: `"test: patch coverage gaps identified in audit"`
  - [ ] Push to branch

- [ ] **Task 3: E2E test expansion**
  - [ ] Review Playwright test suite; identify any user flows not covered
  - [ ] Add tests for: error states (LM Studio offline), regeneration, mobile viewport, keyboard navigation flow
  - [ ] Commit: `"test(e2e): expand E2E coverage for error states and edge flows"`
  - [ ] Push to branch

- [ ] **Task 4: Performance profiling and optimisation**
  - [ ] Profile the app with Chrome DevTools Performance tab for a 10-category tree
  - [ ] Identify any frames dropping below 60fps
  - [ ] Document findings; implement any quick wins
  - [ ] Commit: `"perf: apply findings from performance profiling session"`
  - [ ] Push to branch

- [ ] **Task 5: V2 Feature Brainstorm Document**
  - [ ] Create `docs/V2_ROADMAP.md`
  - [ ] Document the following V2 directions:
    - **Multiple visualisation modes**: radial graph, force-directed graph, flat mind-map
    - **Export**: download tree as PNG, SVG, or JSON
    - **Session persistence**: save and restore trees via `localStorage` (Zustand `persist`)
    - **Multi-seed comparison**: grow two trees side by side and visually compare meme overlap
    - **Collaborative mode**: WebRTC or WebSocket sync for shared real-time exploration
    - **Custom AI personas**: system-prompt presets for different decomposition styles (scientific, poetic, technical)
    - **Node editing**: manually edit leaf content inline; add new nodes by clicking empty branches
    - **Search & filter**: highlight all nodes matching a keyword; dim non-matching nodes
    - **Minimap overlay**: 2D top-down minimap for navigating large trees
    - **Audio mode**: generate ambient soundscapes using Web Audio API based on tree structure
    - **Streaming tree growth**: animate the tree growing in real-time as the AI streams its response, one node at a time
    - **Visual themes**: dark forest, neon cyberpunk, parchment manuscript
  - [ ] Commit: `"docs: add V2 roadmap with feature brainstorm"`
  - [ ] Push to branch

- [ ] **Phase 8 Wrap-up:**
  - [ ] All tests pass; coverage thresholds met
  - [ ] `docs/V2_ROADMAP.md` committed
  - [ ] Final PR reviewed with explicit sign-off that codebase is V1-complete
  - [ ] Merge `feature/phase-8-review-and-expand` into `main` via PR
  - [ ] Merge `feature/phase-9-review-and-expand` into `main` via PR
  - [ ] Tag release: `git tag v1.0.0`
