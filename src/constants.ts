/**
 * Application-wide constants for SeedHeart.
 * All magic numbers live here; import via `@/constants`.
 */

// ─── Visualization Modes ─────────────────────────────────────────────────────

export type VisualizationMode = 'mycelium' | 'crystal' | 'ink' | 'circuit' | 'mandala'

export const VISUALIZATION_MODES: VisualizationMode[] = [
  'mycelium',
  'crystal',
  'ink',
  'circuit',
  'mandala',
]

export const DEFAULT_VISUALIZATION_MODE: VisualizationMode = 'mycelium'

// ─── Tree / Graph ─────────────────────────────────────────────────────────────

export const MAX_TREE_DEPTH = Number(import.meta.env.VITE_MAX_TREE_DEPTH ?? 6)
export const MAX_TREE_BREADTH = Number(import.meta.env.VITE_MAX_TREE_BREADTH ?? 5)

// ─── Camera ──────────────────────────────────────────────────────────────────

export const CAMERA_FOV = 60
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 1000
export const CAMERA_DEFAULT_POSITION = { x: 0, y: 8, z: 20 } as const
export const CAMERA_TWEEN_DURATION_MS = 600

// ─── Renderer ────────────────────────────────────────────────────────────────

export const RENDERER_FADE_DURATION_MS = 300
export const ENABLE_SCENE_ROTATION = import.meta.env.VITE_ENABLE_SCENE_ROTATION === 'true'

// ─── LM Studio API ───────────────────────────────────────────────────────────

export const LM_STUDIO_BASE_URL =
  import.meta.env.VITE_LM_STUDIO_BASE_URL ?? 'http://localhost:1234/v1'
export const LM_STUDIO_MODEL = import.meta.env.VITE_LM_STUDIO_MODEL ?? 'local-model'
export const LM_STUDIO_TEMPERATURE = Number(import.meta.env.VITE_LM_STUDIO_TEMPERATURE ?? 0.7)
export const LM_STUDIO_MAX_TOKENS = Number(import.meta.env.VITE_LM_STUDIO_MAX_TOKENS ?? 1024)

// ─── Color Palettes ──────────────────────────────────────────────────────────

export const PALETTE = {
  mycelium: {
    background: '#040d0d',
    node: '#0d7377',
    nodeHover: '#14ffec',
    edge: '#322f3d',
    particle: '#7b2d8b',
  },
  crystal: {
    background: '#05040f',
    node: '#3d2b8e',
    nodeHover: '#c0a0ff',
    edge: '#6a4fcf',
    sparkle: '#ffffff',
  },
  ink: {
    background: '#f5edd6',
    node: '#1a1008',
    nodeHover: '#3d2b14',
    edge: '#2e200e',
    label: '#0d0800',
  },
  circuit: {
    background: '#080810',
    node: '#ff2d78',
    nodeHover: '#00f5ff',
    edge: '#00ff41',
    pulse: '#ff2d78',
  },
  mandala: {
    background: '#06040f',
    node: '#c9a84c',
    nodeHover: '#ffd700',
    edge: '#8b1a1a',
    ring: '#1a1464',
  },
} as const
