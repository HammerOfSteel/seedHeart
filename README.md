# SeedHeart

> A living, breathing mind-map. Drop in any idea — SeedHeart grows it into an interactive 3D organic structure powered by local AI.

---

## Overview

SeedHeart is a browser-based visual knowledge tool that decomposes any concept into its smallest meaningful units — **memes** (in Terence McKenna's sense: the atomic building blocks of an idea) — and renders them as an animated, explorable 3D structure in Three.js.

Feed it a seed idea. The local AI (via LM Studio) breaks it into memes, organises them into a hierarchy, and SeedHeart renders that hierarchy as one of five distinct living visualizations — each with its own aesthetic, physics, and personality. Every node holds a distilled concept, prompt, or piece of research you can read, copy, or regenerate.

**Use cases:**
- Brainstorming & idea expansion
- Research organisation
- Story / world-building trees
- Tech-stack visualisation
- Todo structures & project roadmaps
- Visual novels & narrative branching

---

## Visualization Modes

SeedHeart ships with five fully distinct rendering modes. Each consumes the same meme-tree data and can be switched at runtime.

| Mode | Type | Aesthetic | Key Effect |
|---|---|---|---|
| **Mycelium Neural Web** | 3D (Three.js) | Bioluminescent deep-sea organism | Particle streams flow along bezier tendrils; hover triggers ripple propagation through the graph |
| **Crystal Geode** | 3D (Three.js) | Iridescent cave crystals | Nodes crystallise into existence in BFS order; orbiting lights create shifting refraction play |
| **Ink Diffusion** | 2D (Canvas) | Living manuscript on parchment | Nodes bloom as ink drops; connections bleed as watercolour washes; labels write themselves character by character |
| **Neon Circuit** | 2D (Canvas) | Cyberpunk PCB | Pulse dots travel orthogonal routing traces; hover triggers a glitch/corrupted-text effect |
| **Living Mandala** | 2D (Canvas) | Sacred geometry / breathing mandala | Concentric rings rotate at different speeds; sub-trees bloom as nested mini-mandalas |

See [docs/VISUALIZATIONS.md](docs/VISUALIZATIONS.md) for full technical specifications for each mode.

---

## Key Features

| Feature | Description |
|---|---|
| **5 Visualization Modes** | Switch between radically different renderers — same data, entirely different experience |
| **Interactive Nodes** | Click any node to focus and read its content; hover to highlight; regenerate AI content per-node |
| **Local AI Integration** | LM Studio (OpenAI-compatible) decomposes any idea into structured meme hierarchies |
| **Glass Morphism UI** | Warm, modern overlay panels for node details, copy, and regeneration |
| **Smooth Transitions** | TWEEN-based camera focus (3D) and bloom/scale animations (2D) for all interactions |
| **Regeneration** | Re-roll the content of any leaf node without rebuilding the tree |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **3D Rendering** | [Three.js](https://threejs.org/) r128+ |
| **Animation** | [TWEEN.js](https://github.com/tweenjs/tween.js) 18.x |
| **UI Framework** | React 18 + TypeScript |
| **Styling** | Tailwind CSS v3 |
| **Build Tool** | Vite 5 |
| **State Management** | Zustand |
| **AI Backend** | LM Studio (local, OpenAI-compatible REST API) |
| **Testing** | Vitest (unit), Playwright (E2E) |

---

## Prerequisites

- **Node.js** >= 20 LTS
- **npm** >= 10 (or pnpm/yarn)
- **LM Studio** >= 0.3 — [download](https://lmstudio.ai/) — with a chat model loaded and the local server running on `http://localhost:1234`

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/seedheart.git
cd seedheart

# 2. Install dependencies
npm install

# 3. Copy environment config
cp .env.example .env

# 4. Edit .env — point at your LM Studio server
# VITE_LM_STUDIO_BASE_URL=http://localhost:1234/v1
# VITE_LM_STUDIO_MODEL=your-model-id

# 5. Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### LM Studio Configuration

1. Open LM Studio and load any instruction-following model (e.g. Llama-3-8B-Instruct, Mistral-7B).
2. Go to **Local Server** tab and click **Start Server**.
3. The server defaults to `http://localhost:1234`. Confirm the model ID shown and paste it into `.env`.

---

## Usage

### Growing a Tree

1. Type your seed idea into the **input panel** (e.g. `"the philosophy of time"`, `"a cyberpunk heist story"`).
2. Click **Grow**. SeedHeart sends the idea to your local AI and receives a structured meme hierarchy.
3. The 3D tree assembles — top-level branches are the primary memes, sub-branches are elaborations, leaves are the finest-grained concepts or prompts.

### Exploring

| Interaction | Action |
|---|---|
| **Click leaf** | Zoom camera to node, open detail panel |
| **Click & drag** | Orbit the tree |
| **Scroll** | Zoom in / out |
| **← Zoom Out** | Reset camera to overview |
| **Regenerate (↺)** | Re-roll the leaf's AI-generated content |
| **Copy** | Copy the node's content to clipboard |

### Running the POC

The standalone proof-of-concept is available without any build step:

```bash
open inspiration_poc.html
# or just double-click it in Finder
```

This runs a hardcoded Suno AI music-prompt tree entirely in the browser — no server or AI required.

---

## Project Structure

```
seedheart/
├── inspiration_poc.html   # Self-contained Three.js POC (no build required)
├── src/
│   ├── components/        # React UI components
│   ├── engine/            # Three.js scene, renderer, lighting, controls
│   ├── graph/             # Meme tree data model and procedural geometry
│   ├── ai/                # LM Studio API client and prompt templates
│   ├── store/             # Zustand state slices
│   └── main.tsx           # App entry point
├── tests/
│   ├── unit/              # Vitest unit tests
│   └── e2e/               # Playwright E2E tests
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── API_REFERENCE.md
│   └── STATE_MANAGEMENT.md
├── TODO.md
└── README.md
```

---

## Documentation

| Document | Description |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, component breakdown |
| [docs/VISUALIZATIONS.md](docs/VISUALIZATIONS.md) | All 5 visualization modes — aesthetics, technical specs, color palettes |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Git workflow, branching strategy, PR guidelines |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | LM Studio API integration & internal module APIs |
| [docs/STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md) | Zustand store design, slices, and data flow |
| [TODO.md](TODO.md) | Phased implementation plan with test-driven tasks |

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the full Git workflow.

Quick summary:
- Each **phase** = a feature branch off `main`
- Each **commit** = one atomic task
- Every task requires passing tests before merge
- PRs are required — no direct pushes to `main`

---

## License

MIT
