import { create } from 'zustand'
import type { MemeTree, NodeId } from '@/graph/types'
import type { VisualizationMode } from '@/constants'
import { DEFAULT_VISUALIZATION_MODE } from '@/constants'

// ─── Slice types ──────────────────────────────────────────────────────────────

interface AISlice {
  seedIdea: string
  isGenerating: boolean
  error: string | null
  setSeedIdea: (idea: string) => void
  setGenerating: (v: boolean) => void
  setError: (err: string | null) => void
}

interface DataSlice {
  tree: MemeTree | null
  setTree: (tree: MemeTree) => void
  clearTree: () => void
}

interface InteractionSlice {
  hoveredId: NodeId | null
  selectedId: NodeId | null
  setHovered: (id: NodeId | null) => void
  setSelected: (id: NodeId | null) => void
}

interface CameraSlice {
  focusedId: NodeId | null
  isAnimating: boolean
  setFocused: (id: NodeId | null) => void
  setAnimating: (v: boolean) => void
}

interface UISlice {
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
}

interface VisualizationSlice {
  activeMode: VisualizationMode
  setActiveMode: (mode: VisualizationMode) => void
}

// ─── Combined store type ──────────────────────────────────────────────────────

export type SeedHeartStore = AISlice &
  DataSlice &
  InteractionSlice &
  CameraSlice &
  UISlice &
  VisualizationSlice

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSeedHeartStore = create<SeedHeartStore>()((set) => ({
  // AI slice
  seedIdea: '',
  isGenerating: false,
  error: null,
  setSeedIdea: (idea) => set({ seedIdea: idea }),
  setGenerating: (v) => set({ isGenerating: v }),
  setError: (err) => set({ error: err }),

  // Data slice
  tree: null,
  setTree: (tree) => set({ tree }),
  clearTree: () => set({ tree: null }),

  // Interaction slice
  hoveredId: null,
  selectedId: null,
  setHovered: (id) => set({ hoveredId: id }),
  setSelected: (id) => set({ selectedId: id }),

  // Camera slice
  focusedId: null,
  isAnimating: false,
  setFocused: (id) => set({ focusedId: id }),
  setAnimating: (v) => set({ isAnimating: v }),

  // UI slice
  isPanelOpen: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  // Visualization slice
  activeMode: DEFAULT_VISUALIZATION_MODE,
  setActiveMode: (mode) => set({ activeMode: mode }),
}))
