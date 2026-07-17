# API Reference

This document covers two API surfaces:
1. **LM Studio Integration** — the external AI API SeedHeart calls
2. **Internal Module APIs** — the TypeScript interfaces between SeedHeart's own modules

---

## Part 1: LM Studio Integration

LM Studio exposes an OpenAI-compatible REST API. SeedHeart uses the `/v1/chat/completions` endpoint only.

### Base URL

```
http://localhost:1234/v1
```

Configurable via `VITE_LM_STUDIO_BASE_URL` in `.env`.

### Authentication

LM Studio's local server does not require authentication. The `Authorization: Bearer lm-studio` header is sent as a no-op placeholder for compatibility with middleware that requires it.

---

### `POST /v1/chat/completions`

Decomposes a seed idea into a structured meme hierarchy.

#### Request

```http
POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer lm-studio
```

```json
{
  "model": "your-model-id",
  "messages": [
    {
      "role": "system",
      "content": "You are a knowledge decomposition engine. Given any concept, break it down into a hierarchical tree of its core 'memes' — the atomic units of meaning. Return ONLY valid JSON matching the schema provided. No prose, no markdown, no explanation."
    },
    {
      "role": "user",
      "content": "Seed idea: \"the philosophy of time\"\n\nReturn a JSON object with this exact schema:\n{\n  \"seed\": string,\n  \"memes\": [ { \"label\": string, \"content\": string, \"children\": [...] } ]\n}\nMax depth: 3 levels. Max 8 items per level."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": false
}
```

#### Response

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1720000000,
  "model": "your-model-id",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{ \"seed\": \"the philosophy of time\", \"memes\": [ ... ] }"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 180,
    "completion_tokens": 450,
    "total_tokens": 630
  }
}
```

The `content` field is a JSON string that `TreeParser.ts` parses and validates.

#### Error Handling

| HTTP Status | Cause | SeedHeart Behaviour |
|---|---|---|
| `200` | Success | Parse and render tree |
| `400` | Malformed request | Show error toast, log to console |
| `404` | Model not loaded | Show "Model not found" toast with instructions |
| `500` | Model crashed / OOM | Show error toast with retry button |
| Network error | LM Studio not running | Show "Cannot connect" toast with setup link |

---

### Streaming Mode

For large trees, streaming is supported. Set `"stream": true` in the request. The client reads `text/event-stream` chunks, buffers them, and only parses the complete JSON once `[DONE]` is received.

```typescript
// src/ai/LMStudioClient.ts
async function generateTreeStreaming(seed: string): Promise<MemeTree> {
  // ... reads SSE stream, accumulates content, then calls TreeParser
}
```

---

## Part 2: Internal Module APIs

---

### `LMStudioClient`

**Path:** `src/ai/LMStudioClient.ts`

```typescript
class LMStudioClient {
  constructor(config: LMStudioConfig)

  /**
   * Sends a seed string to LM Studio and returns a parsed MemeTree.
   * Throws LMStudioError on network failure or model error.
   */
  async generateTree(seed: string): Promise<MemeTree>

  /**
   * Checks if the LM Studio server is reachable.
   * Returns the loaded model ID if connected, null otherwise.
   */
  async ping(): Promise<string | null>
}

interface LMStudioConfig {
  baseUrl: string         // e.g. "http://localhost:1234/v1"
  model: string           // e.g. "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF"
  temperature?: number    // default: 0.7
  maxTokens?: number      // default: 2048
}
```

---

### `TreeParser`

**Path:** `src/ai/TreeParser.ts`

```typescript
/**
 * Parses and validates a raw JSON string from the AI into a MemeTree.
 * Throws ParseError if the JSON is malformed or violates the schema.
 */
function parseTree(rawJson: string, seed: string, model: string): MemeTree

/**
 * Validates a single Meme node recursively.
 * Trims children beyond MAX_DEPTH (3) and MAX_BREADTH (8).
 */
function validateMeme(raw: unknown, depth?: number): Meme
```

---

### `TreeBuilder`

**Path:** `src/engine/TreeBuilder.ts`

```typescript
class TreeBuilder {
  constructor(scene: THREE.Scene, store: SeedHeartStore)

  /**
   * Builds Three.js geometry for the given MemeTree.
   * Disposes any previously built tree before building.
   * Populates store.visualNodes after build completes.
   */
  build(tree: MemeTree): void

  /**
   * Disposes all geometry and materials created by the last build() call.
   */
  dispose(): void
}
```

---

### `InteractionSystem`

**Path:** `src/engine/InteractionSystem.ts`

```typescript
class InteractionSystem {
  constructor(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    store: SeedHeartStore
  )

  /**
   * Registers leaf meshes as raycast targets.
   * Call after TreeBuilder.build() completes.
   */
  setTargets(meshes: THREE.Mesh[]): void

  /**
   * Enables mousemove and click listeners on the canvas.
   */
  enable(): void

  /**
   * Removes all event listeners. Call before disposing the scene.
   */
  disable(): void
}
```

---

### `CameraController`

**Path:** `src/engine/CameraController.ts`

```typescript
class CameraController {
  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls
  )

  /**
   * Tweens the camera to focus on a world-space position.
   * Duration is in milliseconds (default: 1200).
   */
  focusOn(worldPosition: THREE.Vector3, duration?: number): void

  /**
   * Tweens the camera back to the default overview position.
   */
  reset(duration?: number): void

  /**
   * Must be called in the animation loop to update OrbitControls damping.
   */
  update(): void
}
```

---

### `ColorPalette`

**Path:** `src/graph/ColorPalette.ts`

```typescript
/**
 * Returns a stable hex colour for a root-level meme index.
 * Colours are drawn from the warm ACES-tuned palette defined in constants.ts.
 */
function getRootColor(index: number): number

/**
 * Returns a derived colour for a child meme by shifting the root colour's
 * HSL lightness by the given depth.
 */
function getDerivedColor(rootColor: number, depth: number): number
```

---

### `TreeLayout`

**Path:** `src/graph/TreeLayout.ts`

```typescript
interface BranchLayout {
  heightRatio: number     // 0–1 position along the trunk
  angleY: number          // radians, golden-angle spiral
  angleZ: number          // radians, outward tilt
  length: number          // world units
  radiusBase: number
  radiusTop: number
}

/**
 * Computes layout parameters for all branches at a given depth level.
 */
function computeLayout(
  parentCount: number,
  depth: number,
  options?: LayoutOptions
): BranchLayout[]

interface LayoutOptions {
  trunkHeight?: number        // default: 22
  minLength?: number
  maxLength?: number
  useGoldenAngle?: boolean    // default: true
}
```

---

## Part 3: Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_LM_STUDIO_BASE_URL` | Yes | — | LM Studio server base URL |
| `VITE_LM_STUDIO_MODEL` | Yes | — | Model ID as shown in LM Studio |
| `VITE_LM_STUDIO_TEMPERATURE` | No | `0.7` | Sampling temperature (0–2) |
| `VITE_LM_STUDIO_MAX_TOKENS` | No | `2048` | Max tokens per completion |
| `VITE_MAX_TREE_DEPTH` | No | `3` | Maximum meme hierarchy depth |
| `VITE_MAX_TREE_BREADTH` | No | `8` | Maximum children per meme node |
| `VITE_ENABLE_SCENE_ROTATION` | No | `true` | Slow ambient scene auto-rotation |
