# State Management

SeedHeart uses **Zustand** for global state. This document describes the store's shape, slices, and data flow conventions.

---

## Why Zustand

- No boilerplate (no reducers, no actions, no providers)
- Subscribable from outside React (Three.js engine can subscribe directly)
- Supports devtools middleware out of the box
- Tiny bundle footprint

---

## Store Shape

```typescript
// src/store/index.ts

interface SeedHeartStore {
  // ── AI / Data slice ──────────────────────────────────────────
  seed: string
  memeTree: MemeTree | null
  isGenerating: boolean
  generationError: string | null

  setSeed: (seed: string) => void
  setMemeTree: (tree: MemeTree) => void
  setGenerating: (loading: boolean) => void
  setGenerationError: (error: string | null) => void
  clearTree: () => void

  // ── Interaction slice ────────────────────────────────────────
  hoveredNodeId: string | null
  selectedNodeId: string | null
  visualNodes: Map<string, VisualNode>

  setHoveredNode: (memeId: string | null) => void
  setSelectedNode: (memeId: string | null) => void
  setVisualNodes: (nodes: Map<string, VisualNode>) => void

  // ── Camera slice ─────────────────────────────────────────────
  isCameraZoomedIn: boolean
  setCameraZoomedIn: (zoomed: boolean) => void

  // ── UI slice ─────────────────────────────────────────────────
  isPanelOpen: boolean
  toast: Toast | null

  setPanelOpen: (open: boolean) => void
  showToast: (toast: Toast) => void
  dismissToast: () => void
}

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
  durationMs?: number   // default: 3000
}
```

---

## Slice Ownership

| Slice | Written by | Read by |
|---|---|---|
| `seed`, `memeTree`, `isGenerating`, `generationError` | `SeedInput` component, `LMStudioClient` | `Toolbar`, `TreeBuilder`, `NodeDetailPanel` |
| `hoveredNodeId`, `selectedNodeId` | `InteractionSystem` (Three.js) | `NodeDetailPanel`, `TreeBuilder` (for emissive updates) |
| `visualNodes` | `TreeBuilder` | `InteractionSystem`, `CameraController` |
| `isCameraZoomedIn` | `CameraController` | `Toolbar` (show/hide zoom-out button), `SceneManager` (pause rotation) |
| `isPanelOpen` | `InteractionSystem`, reset button | `NodeDetailPanel` |
| `toast` | Any module | `ToastNotification` |

---

## Store Initialisation

```typescript
// src/store/index.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useSeedHeartStore = create<SeedHeartStore>()(
  devtools(
    (set) => ({
      // AI / Data
      seed: '',
      memeTree: null,
      isGenerating: false,
      generationError: null,
      setSeed: (seed) => set({ seed }),
      setMemeTree: (tree) => set({ memeTree: tree, isGenerating: false, generationError: null }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setGenerationError: (error) => set({ generationError: error, isGenerating: false }),
      clearTree: () => set({ memeTree: null, selectedNodeId: null, hoveredNodeId: null, visualNodes: new Map() }),

      // Interaction
      hoveredNodeId: null,
      selectedNodeId: null,
      visualNodes: new Map(),
      setHoveredNode: (id) => set({ hoveredNodeId: id }),
      setSelectedNode: (id) => set({ selectedNodeId: id, isPanelOpen: id !== null }),
      setVisualNodes: (nodes) => set({ visualNodes: nodes }),

      // Camera
      isCameraZoomedIn: false,
      setCameraZoomedIn: (zoomed) => set({ isCameraZoomedIn: zoomed }),

      // UI
      isPanelOpen: false,
      toast: null,
      setPanelOpen: (open) => set({ isPanelOpen: open }),
      showToast: (toast) => set({ toast }),
      dismissToast: () => set({ toast: null }),
    }),
    { name: 'SeedHeartStore' }
  )
)
```

---

## Subscribing from Three.js (Outside React)

The Three.js engine modules are plain TypeScript classes, not React components. They subscribe to store slices using Zustand's `subscribe` method.

```typescript
// src/engine/TreeBuilder.ts
import { useSeedHeartStore } from '../store'

export class TreeBuilder {
  private unsubscribe: () => void

  constructor(scene: THREE.Scene) {
    // Subscribe to memeTree changes and rebuild when a new tree arrives
    this.unsubscribe = useSeedHeartStore.subscribe(
      (state) => state.memeTree,
      (tree) => {
        if (tree) this.build(tree)
      }
    )
  }

  dispose() {
    this.unsubscribe()
    // ... dispose geometry
  }
}
```

```typescript
// src/engine/InteractionSystem.ts
import { useSeedHeartStore } from '../store'

// Write to store from event handler (no subscription needed)
function onClick(mesh: THREE.Mesh) {
  const memeId = mesh.userData.memeId
  useSeedHeartStore.getState().setSelectedNode(memeId)
}
```

---

## Data Flow Diagram

```
User types seed
      │
      ▼
useSeedHeartStore.setSeed(input)
useSeedHeartStore.setGenerating(true)
      │
      ▼
LMStudioClient.generateTree(seed)
      │ (async, awaits AI response)
      ▼
useSeedHeartStore.setMemeTree(parsedTree)
      │
      ├── TreeBuilder subscription fires → builds 3D geometry
      │         └── useSeedHeartStore.setVisualNodes(map)
      │
      └── React re-renders:
            Toolbar shows new seed label
            LoadingOverlay hides

User clicks a leaf
      │
      ▼
InteractionSystem.onClick()
      │
useSeedHeartStore.setSelectedNode(memeId)
      │
      ├── NodeDetailPanel reads selectedNodeId
      │     └── looks up memeTree to get content
      │     └── slides open (isPanelOpen = true)
      │
      └── CameraController reads visualNodes.get(memeId).worldPosition
            └── tweens camera to focus
            └── useSeedHeartStore.setCameraZoomedIn(true)
                      └── Toolbar renders "← Zoom Out" button
```

---

## Persisting State (Future)

In a future phase, the `memeTree` and `seed` slices can be persisted to `localStorage` using Zustand's `persist` middleware, allowing session restore on page reload.

```typescript
import { persist } from 'zustand/middleware'

// Wrap the store creation with persist():
create<SeedHeartStore>()(
  devtools(
    persist(
      (set) => ({ ... }),
      {
        name: 'seedheart-storage',
        partialize: (state) => ({ seed: state.seed, memeTree: state.memeTree }),
      }
    )
  )
)
```

This is tracked as a V2 task in `TODO.md`.
