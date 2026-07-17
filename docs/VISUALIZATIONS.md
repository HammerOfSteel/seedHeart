# SeedHeart — Visualization Modes

SeedHeart supports five distinct visualization modes. Each is a self-contained renderer that consumes the same `MemeTree` data from the Zustand store. The user can switch modes at any time; the active renderer is torn down and the new one is instantiated with the same data.

The modes deliberately span a wide aesthetic and technical range — from organic and bioluminescent to geometric and cyberpunk — to showcase the full expressive range of the platform.

---

## The Renderer Contract

Every visualization mode implements the `IRenderer` interface:

```typescript
interface IRenderer {
  /** Mount the visualization into the given container element */
  mount(container: HTMLElement): void

  /** Build or rebuild the visualization from a MemeTree */
  render(tree: MemeTree): void

  /** React to a node being hovered (id = null to clear) */
  onHover(memeId: string | null): void

  /** React to a node being selected (id = null to deselect) */
  onSelect(memeId: string | null): void

  /** Tear down all resources — event listeners, WebGL contexts, animation frames */
  dispose(): void
}
```

This allows the rest of the app (React UI, Zustand store, `InteractionSystem`) to remain completely unaware of which renderer is active.

---

## Mode 1 — Mycelium Neural Web (3D)

**Aesthetic:** Bioluminescent deep-sea organism. Primordial, alive, slightly eerie.  
**Technology:** Three.js, custom `TubeGeometry` with animated UVs, GPU particle system  
**Feeling:** Like watching neurons fire in slow motion inside something ancient

### Visual Description

- **Background:** Near-black with a faint deep-blue volumetric `FogExp2`. No environment geometry — pure void.
- **Nodes:** Soft icosphere meshes with a `MeshPhysicalMaterial` — transmission enabled, slight roughness, emissive glow. They breathe via a slow `sin(time)` scale oscillation, each offset by its index so they don't pulse in unison.
- **Connections:** `TubeGeometry` paths following a 3D bezier curve between parent and child nodes. The tube mesh has animated texture UVs scrolling along its length — giving the impression of substance flowing through the tendrils.
- **Particle Streams:** A `Points` system places ~30 particles per connection. Each particle travels from parent to child at a randomised speed. On arrival it emits a brief flash on the target node.
- **Ripple on Hover:** Selecting a node dispatches a `ripple` event that propagates outward hop-by-hop through the graph via `setTimeout` chains, lighting each connected node momentarily.
- **Depth sizing:** Root node is the largest sphere. Each depth level reduces radius by 30%. Leaf nodes are tiny, like spores.

### Color Palette

| Role | Hex | Description |
|---|---|---|
| Background fog | `#020812` | Near-black, deep ocean |
| Node base | `#1a6b8a` | Deep teal |
| Node emissive (idle) | `#0d4d6e` | Subdued glow |
| Node emissive (hover) | `#00e5ff` | Electric cyan |
| Node emissive (selected) | `#7c4dff` | Deep violet |
| Tendril | `#0a3d52` | Dark teal tube |
| Particle | `#b2ebf2` | Bright ice blue |

### Key Technical Notes

- Use `THREE.QuadraticBezierCurve3` for connection paths (not straight lines — everything curves)
- The bezier control point is offset perpendicular to the midpoint + a random Y lift to prevent crossings
- Share a single `TubeGeometry` template; use `InstancedMesh` won't work for tubes — instead share the material and create individual geometries but dispose them cleanly
- The particle system is one `BufferGeometry` with a `Float32Array` position attribute updated per frame — never recreate geometry per frame
- Oscillation: `node.scale.setScalar(1 + 0.06 * Math.sin(time * 0.8 + index * 0.4))`

---

## Mode 2 — Crystal Geode / Constellation (3D)

**Aesthetic:** A cave of living crystals. Precise, beautiful, otherworldly.  
**Technology:** Three.js, custom iridescence shader (`MeshPhysicalMaterial` + iridescence maps), `ConeGeometry` spires  
**Feeling:** Staring into a geode the size of a cathedral

### Visual Description

- **Background:** Dark charcoal (`#0d0d0f`) with a subtle point light suggesting a distant cave mouth. No fog — clarity is key.
- **Nodes:** `OctahedronGeometry` (detail level 0 for facets, 1 for the root). Material: `MeshPhysicalMaterial` with `iridescence: 1.0`, `iridescenceIOR: 1.8`, `roughness: 0.05`, `metalness: 0.0`, `transmission: 0.4`. Each node has a unique `iridescenceThicknessRange` so they refract different colours.
- **Node Growth Animation:** On `render()`, nodes start at `scale(0)` and tween to `scale(1)` in a staggered sequence (BFS order — root first, then each depth level 300ms after the previous). They appear to crystallise out of nothing.
- **Connections:** Thin `ConeGeometry` spires pointing from parent to child, tapered — wide at the parent, needle-thin at the child. Material matches the connected node's iridescence colour but with lower intensity.
- **Lighting:** Three `PointLight` instances positioned at the vertices of an equilateral triangle around the structure, each a different colour (warm white, cold blue, faint gold). They slowly orbit the structure creating shifting light play.
- **Sparkle on Hover:** Hovering a node spawns a brief `Points` burst — 20 particles explode outward from the node and fade over 0.8s (GPU-side with a custom shader that fades by `lifetime` uniform).
- **Slow rotation:** The entire `crystalGroup` rotates at `0.0003 rad/frame` around Y — just enough to keep the light play alive.

### Color Palette

The palette is dynamic — driven by `iridescence` so it shifts as you orbit. Base tints per depth:

| Depth | Base Tint | Feel |
|---|---|---|
| 0 (root) | `#e8d5b7` | Warm quartz |
| 1 | `#b0c4de` | Steel blue sapphire |
| 2 | `#d4a0c8` | Amethyst rose |
| 3 (leaf) | `#a8e6cf` | Pale emerald |

### Key Technical Notes

- `MeshPhysicalMaterial` requires `renderer.physicallyCorrectLights = true` and `renderer.outputEncoding = THREE.sRGBEncoding`
- The iridescence effect requires Three.js r152+ — pin the dependency
- Spire geometry: `new THREE.ConeGeometry(0.15, connectionLength, 5)` rotated to point along the direction vector using `quaternion.setFromUnitVectors(UP, direction)`
- Camera starts above and slightly to the side; initial target is the root node world position
- On node select, tween camera to look at selected node from a fixed offset distance of 8 units

---

## Mode 3 — Ink Diffusion / Living Manuscript (2D)

**Aesthetic:** A page from a thinking person's journal that writes itself.  
**Technology:** HTML5 Canvas 2D API, simplified diffusion algorithm, `OffscreenCanvas` for texture blending  
**Feeling:** Watching an invisible hand ink a diagram onto ancient paper

### Visual Description

- **Background:** A warm parchment texture (`#f5edd6`) with a subtle grain (generated via noise on an `OffscreenCanvas` at init — not a loaded image, fully self-contained).
- **Nodes:** Each node is rendered as a circular ink drop. On creation it starts as a single pixel and "blooms" outward using a per-frame radius expansion with a decelerating easing (`easeOutExpo`). The edge is not a clean circle — it has a "bleed" effect: the final radius is drawn with a feathered mask using multiple `arc` strokes with decreasing alpha, simulating ink soaking into paper fibres.
- **Connections:** Drawn as variable-width strokes using `quadraticCurveTo`. The stroke starts at 4px opacity and feathers out like a watercolour wash. A second pass draws a thinner, slightly offset line in a complementary colour to suggest depth.
- **Labels:** Text rendered in a serif font (`'Georgia', serif`). The label animates in character-by-character using `setTimeout` after the node bloom completes — like handwriting appearing.
- **Hover state:** A soft glow ring pulses around the hovered node using `ctx.shadowBlur` and `ctx.shadowColor`.
- **Interaction:** Click registers on the Canvas via `getBoundingClientRect()` hit-testing against stored node positions. No external library needed.
- **Animation loop:** `requestAnimationFrame`; the diffusion "bleed" is simulated by expanding a radial gradient mask each frame, not actual fluid physics.

### Color Palette

| Element | Value | Description |
|---|---|---|
| Paper bg | `#f5edd6` | Warm parchment |
| Primary ink | `#1a1209` | Near-black sepia |
| Depth 1 nodes | `#8b3a0f` | Burnt sienna |
| Depth 2 nodes | `#1a3a6b` | Indigo |
| Depth 3 nodes | `#2d6b35` | Forest green |
| Connections | `#3d2f1a` | Dark sepia wash |
| Label text | `#1a1209` | Ink black |

### Key Technical Notes

- Render layers (bottom to top): paper texture → connection washes → node blobs → labels → hover glow
- Use a dirty-flag system: only redraw the full canvas when the tree changes; for hover/select, draw only the top layer (labels + glow) on a second canvas stacked via CSS `position: absolute`
- Node bloom timing: root blooms at t=0, depth-1 at t=400ms, depth-2 at t=700ms, depth-3 at t=1000ms (all staggered within level by 60ms each)
- Store each node's final `{x, y, radius}` in `VisualNode` for hit testing

---

## Mode 4 — Neon Circuit / Cyberpunk PCB (2D)

**Aesthetic:** A sentient circuit board. Data flowing through a living system.  
**Technology:** HTML5 Canvas 2D, orthogonal pathfinding for routing traces, CSS `filter: blur()` for glow  
**Feeling:** Jacking into a cyberpunk network and watching it map itself

### Visual Description

- **Background:** `#080810` — near-black with a barely-visible hex grid drawn at 5% opacity (lines, not fills).
- **Nodes:** Regular hexagons. Root node is larger (r=40px). Depth 1: r=28px. Depth 2: r=20px. Leaf: r=14px. Each hexagon has:
  - A dark fill (`#0d1117`)
  - A coloured neon border (2px stroke, node-colour)
  - An inner shadow glow (`ctx.shadowBlur = 12, ctx.shadowColor = nodeColor`)
  - The meme label in a monospace font, truncated to fit
- **Connections:** Orthogonal traces (horizontal + vertical segments, with rounded 4px corners). Not straight lines — they route around nodes using a simple channel-routing algorithm. The trace colour matches the source node's neon colour, 60% opacity.
- **Pulse Animation:** A bright dot travels along each trace from parent to child, looping continuously. All pulses on the same depth level start in sync. On `onSelect`, pulses on all non-selected branches pause; only the path from root to selected node pulses (in a brighter colour).
- **Scanline Overlay:** A full-canvas semi-transparent horizontal gradient (black stripes at ~2px intervals) drawn at 4% opacity on a top canvas layer — not redrawn per frame, just composited via CSS.
- **Hover:** Hovered node's border flashes to white and its label gets a brief "corrupted text" effect (characters randomly replaced for 3 frames then resolved).

### Color Palette

Each depth level gets a distinct neon colour. Colours are defined in `constants.ts`:

| Depth | Colour | Hex |
|---|---|---|
| 0 (root) | Neon white | `#e0e8ff` |
| 1 | Hot pink | `#ff2d78` |
| 2 | Electric blue | `#00cfff` |
| 3 (leaf) | Toxic green | `#39ff14` |

### Key Technical Notes

- The hex grid background is drawn once to an `OffscreenCanvas` at init and composited cheaply per frame
- Orthogonal routing: assign each node to a grid cell; route traces along grid edges using a simplified A* that avoids occupied cells. Store each trace as a `Point[]` path.
- Pulse: each trace stores `t ∈ [0, 1]` (progress). Per frame: `t += speed * dt`. Interpolate position along the stored path points.
- For the scanline: create a `repeating-linear-gradient` CSS background on a `<div>` with `pointer-events: none; mix-blend-mode: multiply` layered over the canvas — no Canvas drawing cost at all
- "Corrupted text" effect: store a `corruptionFrames` counter per node; each frame replace each character with a random char from `'!@#$%^&*01'` then decrement counter

---

## Mode 5 — Living Mandala / Sacred Bloom (2D)

**Aesthetic:** A meditative sacred geometry diagram that breathes like a living thing.  
**Technology:** HTML5 Canvas 2D, polar coordinate layout, SVG for connection arcs  
**Feeling:** A mantra visualised — infinite, symmetrical, deeply calm

### Visual Description

- **Background:** Deep indigo-black (`#06040f`) with a faint Fibonacci spiral drawn at 3% opacity in gold — purely decorative, gives a sense of hidden mathematical order.
- **Layout:** Strictly concentric rings around the seed node at centre:
  - Ring 0 (centre): Root seed node — a large jewel-like circle, 36px radius
  - Ring 1: Primary memes, evenly distributed at r=180px
  - Ring 2: Secondary memes, evenly distributed at r=320px
  - Ring 3 (outer): Leaf memes, at r=480px
  - Each ring rotates at a slightly different angular velocity: `ω₀ = 0`, `ω₁ = 0.0002`, `ω₂ = -0.00015`, `ω₃ = 0.0001` rad/frame
- **Connections:** Drawn as cubic bezier arcs using `ctx.bezierCurveTo`. The control points are pulled inward toward the centre, giving a graceful "petal" curvature. Connection width tapers from parent to child.
- **Node Appearance:** Circles with a layered rendering:
  1. Outer glow ring (large, very transparent `shadowBlur`)
  2. Coloured border ring (2px)
  3. Dark interior with the label in small caps
  - Nodes pulse via `1 + 0.04 * sin(time * 0.6 + ring * 1.2 + indexInRing * 0.3)` radius scale — every node pulses at its own phase, so the mandala has a complex rippling breath.
- **Selection:** Clicking a node opens its sub-tree as a **mini mandala** that blooms from the selected node outward over 600ms, overlaid on the main mandala. The main mandala dims to 30% opacity. A "return" gesture collapses the sub-mandala with a reverse animation.
- **Symmetry option:** A toggle adds a 6-fold rotational symmetry mirror — nodes are rendered at 6 equidistant angles simultaneously, creating a full mandala pattern from even a sparse tree. Pure visual mode — interaction still targets the canonical positions.

### Color Palette

Jewel tones with gold accents:

| Element | Hex | Description |
|---|---|---|
| Background | `#06040f` | Deep indigo-black |
| Fibonacci spiral | `#c8a951` | Faded antique gold |
| Ring 0 (root) | `#ffd700` | Pure gold |
| Ring 1 | `#9b2335` | Deep crimson |
| Ring 2 | `#1b3a7a` | Midnight blue |
| Ring 3 (leaf) | `#6b2d82` | Royal violet |
| Connection arcs | `rgba(200,169,81,0.3)` | Gold wash |
| Label text | `#e8dcc8` | Warm cream |

### Key Technical Notes

- Store each node's **canonical angle** in its ring at `t=0`. Per frame, actual draw angle = `canonicalAngle + ω * elapsedTime`. This means the `onSelect` hit test must account for current rotation offset.
- Fibonacci spiral: precompute the points once using `r = a * sqrt(n), θ = n * goldenAngle` and draw as a `lineTo` path on an `OffscreenCanvas`
- Sub-mandala bloom: scale from 0 to full size over 600ms using `easeOutBack` easing — the slight overshoot gives it a satisfying snap
- The 6-fold symmetry mirror: draw the canvas to an `OffscreenCanvas`, then `ctx.drawImage(offscreen)` 5 more times with rotational transforms — O(1) cost
- Rotation rings must be debounced for hit-testing: compute angle offset at time of click, back-calculate to canonical angle to identify which node was hit

---

## Switching Between Modes

The active renderer is stored in the Zustand store as `activeMode: VisualizationMode`. The `RendererManager` class in `src/engine/RendererManager.ts` handles teardown and init:

```typescript
type VisualizationMode =
  | 'mycelium'      // 3D
  | 'crystal'       // 3D
  | 'ink'           // 2D
  | 'circuit'       // 2D
  | 'mandala'       // 2D

class RendererManager {
  switchTo(mode: VisualizationMode): void  // disposes current, inits new
  getCurrentRenderer(): IRenderer
}
```

A mode-picker UI component (Phase 4 task) renders 5 small preview thumbnails in the toolbar. Switching is instant for 2D modes; 3D modes show a 300ms fade-out/fade-in to mask the context recreation cost.
