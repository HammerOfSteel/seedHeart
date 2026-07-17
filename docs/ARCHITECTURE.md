# SeedHeart — Architecture

## 1. High-Level Overview

SeedHeart is a single-page application (SPA) split into four clearly separated concerns:

```
┌───────────────────────────────────────────────────────────────────────┐
│                            Browser (SPA)                              │
│                                                                       │
│  ┌─────────────┐   ┌────────────────────────┐   ┌─────────────────┐  │
│  │  React UI   │   │   Renderer Manager     │   │   AI Client     │  │
│  │  (Overlay)  │◄──│  (IRenderer Strategy)  │   │ (LM Studio API) │  │
│  └──────┬──────┘   └────────────────────────┘   └───────┬─────────┘  │
│         │              ▲        ▲                        │            │
│         │    ┌─────────┘        └──────────┐            │            │
│         │  3D Renderers           2D Renderers           │            │
│         │  (Three.js)          (Canvas 2D API)           │            │
│         │                                                │            │
│         └────────────► Zustand Store ◄───────────────────┘           │
└───────────────────────────────────────────────────────────────────────┘
                                              │
                                   HTTP (localhost:1234)
                                              │
                                  ┌───────────▼──────────┐
                                  │   LM Studio Server   │
                                  │ (OpenAI-compatible)  │
                                  └──────────────────────┘
```

- **React UI** renders all overlay panels (seed input, node detail, toolbar, mode picker). Never touches renderers directly.
- **Renderer Manager** implements the Strategy pattern — it holds the active `IRenderer` instance and handles teardown + init when the mode changes. All five visualization modes implement `IRenderer`.
- **AI Client** is a pure async module. It calls LM Studio and returns a structured `MemeTree` written into the store.

### Visualization Modes

| Mode | Renderer Class | Canvas Type |
|---|---|---|
| Mycelium Neural Web | `MyceliumRenderer` | Three.js WebGL |
| Crystal Geode | `CrystalRenderer` | Three.js WebGL |
| Ink Diffusion | `InkRenderer` | Canvas 2D API |
| Neon Circuit | `CircuitRenderer` | Canvas 2D API |
| Living Mandala | `MandalaRenderer` | Canvas 2D API |

See [VISUALIZATIONS.md](VISUALIZATIONS.md) for full aesthetics and technical specs for each mode.

---

## 2. Data Model

### 2.1 The Meme

The smallest unit of structured knowledge in the system.

```typescript
interface Meme {
  id: string;           // UUID
  label: string;        // Short display label (≤ 40 chars)
  content: string;      // Full content / generated prompt
  depth: number;        // 0 = root, 1 = primary, 2 = secondary, 3 = leaf
  color: number;        // Three.js hex color (inherited from root meme)
  children: Meme[];
}
```

### 2.2 The MemeTree

```typescript
interface MemeTree {
  seed: string;         // The original user input
  root: Meme;           // The root concept
  generatedAt: number;  // Unix timestamp
  model: string;        // LM Studio model ID used
}
```

### 2.3 Visual Node (3D)

Each `Meme` maps 1-to-1 with a `VisualNode` that the engine manages. This separation prevents AI/data concerns from leaking into rendering code.

```typescript
interface VisualNode {
  memeId: string;
  mesh: THREE.Mesh;
  worldPosition: THREE.Vector3;
  isHovered: boolean;
  isSelected: boolean;
}
```

---

## 3. Module Breakdown

### `src/engine/` — Shared engine utilities

| File | Responsibility |
|---|---|
| `RendererManager.ts` | Holds the active `IRenderer`; handles teardown + init on mode switch |
| `IRenderer.ts` | The interface all five visualization modes implement |
| `InteractionSystem.ts` | Mode-agnostic hover/click dispatching — works for both Canvas 2D and WebGL raycasting |
| `CameraController.ts` | TWEEN-based camera animations for 3D modes; wraps `OrbitControls` (no-op for 2D) |

### `src/engine/renderers/` — The five visualization modes

| File | Mode | Type |
|---|---|---|
| `MyceliumRenderer.ts` | Mycelium Neural Web | Three.js |
| `CrystalRenderer.ts` | Crystal Geode | Three.js |
| `InkRenderer.ts` | Ink Diffusion | Canvas 2D |
| `CircuitRenderer.ts` | Neon Circuit | Canvas 2D |
| `MandalaRenderer.ts` | Living Mandala | Canvas 2D |

Each renderer is self-contained: it owns its own canvas/WebGL context, lighting, geometry, and animation loop. `RendererManager` guarantees only one is active at a time.

### `src/graph/`

| File | Responsibility |
|---|---|
| `MemeTree.ts` | TypeScript types (`Meme`, `MemeTree`, `VisualNode`, `IRenderer`) |
| `TreeLayout.ts` | Computes renderer-agnostic layout (polar for 2D modes, 3D Cartesian for WebGL modes) |
| `ColorPalette.ts` | Assigns stable hex colours to root memes; all renderers share this palette |

### `src/ai/`

| File | Responsibility |
|---|---|
| `LMStudioClient.ts` | Thin wrapper around the OpenAI-compatible `/v1/chat/completions` endpoint |
| `PromptTemplates.ts` | System and user prompts that instruct the model to output structured JSON |
| `TreeParser.ts` | Validates and converts raw model JSON into a typed `MemeTree` |

### `src/store/`

See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for the full slice design. The store gains one new slice: `activeMode: VisualizationMode`.

### `src/components/`

| Component | Description |
|---|---|
| `SeedInput` | Textarea + Grow button; fires the AI decomposition flow |
| `ModePicker` | Five thumbnail buttons for switching visualization modes |
| `NodeDetailPanel` | Slide-in panel showing selected node content, copy, regenerate |
| `Toolbar` | Top HUD with title, status indicator, zoom-out, and mode picker |
| `LoadingOverlay` | Full-screen animated loading state during tree generation |
| `ToastNotification` | Ephemeral feedback for copy/error events |

---

## 4. Data Flow

### 4.1 Idea Input → Tree Generation

```
User types seed idea
        │
        ▼
   SeedInput.tsx
        │  dispatch: store.setLoading(true)
        │  dispatch: store.setSeed(input)
        ▼
   LMStudioClient.ts
        │  POST /v1/chat/completions
        │  (streaming or single-shot)
        ▼
   TreeParser.ts
        │  validate JSON → MemeTree
        ▼
   store.setMemeTree(tree)
        │
        ├──► React UI re-renders (new seed shown in toolbar)
        │
        └──► TreeBuilder.ts (subscribed to store) rebuilds 3D geometry
                    │
                    └──► InteractionSystem.ts registers new raycast targets
```

### 4.2 Node Interaction

```
Mouse move / click on canvas
        │
        ▼
   InteractionSystem.ts (raycaster)
        │  hit detected
        ▼
   store.setHoveredNode(memeId)   ← hover
   store.setSelectedNode(memeId)  ← click
        │
        ├──► 3D Engine: updates emissive intensity + scale on mesh
        │
        └──► React UI: NodeDetailPanel reads store.selectedNode
                       and slides into view
```

---

## 5. Renderer Strategy Pattern

`RendererManager` owns one `IRenderer` instance at a time and brokers all transitions:

```typescript
// Pseudocode — src/engine/RendererManager.ts
class RendererManager {
  private active: IRenderer | null = null

  switchTo(mode: VisualizationMode, container: HTMLElement) {
    // 1. Fade out (300ms CSS transition on the container)
    // 2. active?.dispose()   ← tears down GL context or Canvas + all listeners
    // 3. active = new RendererMap[mode]()
    // 4. active.mount(container)
    // 5. if (store.memeTree) active.render(store.memeTree)
    // 6. Fade in
  }
}
```

### 3D Renderer Scene Graph (Mycelium & Crystal)

Each 3D renderer owns its own `THREE.Scene`. There is no shared scene.

```
MyceliumRenderer.scene              CrystalRenderer.scene
├── AmbientLight (blue-tinted)      ├── PointLight × 3 (orbiting)
├── FogExp2 (#020812)               ├── (no fog — clarity is key)
└── GraphGroup                      └── CrystalGroup
    ├── NodeMesh × N (spheres)          ├── RootGem (OctahedronGeometry)
    └── ConnectionGroup                 ├── GemMesh × N (OctahedronGeometry)
        └── TubeMesh × N                └── SpireGroup
            └── ParticleSystem              └── ConeMesh × N (connections)
```

### 2D Renderer Canvas Stack (Ink, Circuit, Mandala)

All 2D renderers use the same two-canvas composition pattern:

```
<div container>
  <canvas id="base"    /> ← background + node/connection geometry (low redraw frequency)
  <canvas id="overlay" /> ← hover glow, selection highlights, labels (redrawn on interaction)
</div>
```

This avoids redrawing the full tree every time the mouse moves.

---

## 6. AI Prompt Strategy

LM Studio is instructed (via system prompt) to return a strict JSON schema:

```json
{
  "seed": "<user input>",
  "memes": [
    {
      "label": "Primary Concept",
      "content": "Explanation or elaboration...",
      "children": [
        {
          "label": "Sub-concept",
          "content": "...",
          "children": [
            { "label": "Leaf detail", "content": "...", "children": [] }
          ]
        }
      ]
    }
  ]
}
```

Depth is capped at **3 levels** in the prompt. The `TreeParser` enforces this and discards deeper nodes with a warning.

---

LM Studio is instructed (via system prompt) to return a strict JSON schema:

```json
{
  "seed": "<user input>",
  "memes": [
    {
      "label": "Primary Concept",
      "content": "Explanation or elaboration...",
      "children": [
        {
          "label": "Sub-concept",
          "content": "...",
          "children": [
            { "label": "Leaf detail", "content": "...", "children": [] }
          ]
        }
      ]
    }
  ]
}
```

Depth is capped at **3 levels** in the prompt. The `TreeParser` enforces this and discards deeper nodes with a warning.

---

## 7. Performance Considerations

| Concern | Mitigation |
|---|---|
| Many leaf meshes (150+) | Share a single `IcosahedronGeometry` instance across all leaves via `THREE.InstancedMesh` (Phase 4) |
| Raycasting against all leaves | Maintain a flat `raycastTargets: THREE.Mesh[]` array; avoid `scene.traverse` per frame |
| Large trees | LOD: beyond a threshold, swap leaf meshes for `THREE.Points` sprites |
| Re-building tree | Dispose old geometry/materials before rebuilding; track all allocated objects in a `disposable[]` registry |
| Mobile | Reduce pixel ratio, disable shadows on mobile user-agents |

---

## 8. Build & Deployment

```
npm run dev      → Vite dev server (HMR)
npm run build    → Production bundle → dist/
npm run preview  → Preview production build locally
npm run test     → Vitest unit tests
npm run test:e2e → Playwright E2E tests
npm run lint     → ESLint + TypeScript type check
```

The production build is a static bundle and can be served from any CDN (Cloudflare Pages, Vercel, Netlify). The LM Studio server is always local; there is no cloud AI dependency.
