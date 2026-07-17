import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'

describe('useSeedHeartStore', () => {
  beforeEach(() => {
    useSeedHeartStore.setState({
      seedIdea: '',
      isGenerating: false,
      error: null,
      tree: null,
      hoveredId: null,
      selectedId: null,
      focusedId: null,
      isAnimating: false,
      isPanelOpen: false,
      activeMode: 'mycelium',
    })
  })

  afterEach(() => {
    useSeedHeartStore.setState({
      seedIdea: '',
      isGenerating: false,
      error: null,
      tree: null,
      hoveredId: null,
      selectedId: null,
      focusedId: null,
      isAnimating: false,
      isPanelOpen: false,
      activeMode: 'mycelium',
    })
  })

  it('has correct initial values', () => {
    const s = useSeedHeartStore.getState()
    expect(s.seedIdea).toBe('')
    expect(s.isGenerating).toBe(false)
    expect(s.tree).toBeNull()
    expect(s.activeMode).toBe('mycelium')
  })

  it('setSeedIdea updates seedIdea', () => {
    useSeedHeartStore.getState().setSeedIdea('consciousness')
    expect(useSeedHeartStore.getState().seedIdea).toBe('consciousness')
  })

  it('setGenerating toggles isGenerating', () => {
    useSeedHeartStore.getState().setGenerating(true)
    expect(useSeedHeartStore.getState().isGenerating).toBe(true)
  })

  it('setError stores error message', () => {
    useSeedHeartStore.getState().setError('Network error')
    expect(useSeedHeartStore.getState().error).toBe('Network error')
  })

  it('setTree stores the tree', () => {
    const tree = { rootId: 'r', nodes: {}, edges: [] }
    useSeedHeartStore.getState().setTree(tree)
    expect(useSeedHeartStore.getState().tree).toBe(tree)
  })

  it('clearTree nullifies the tree', () => {
    const tree = { rootId: 'r', nodes: {}, edges: [] }
    useSeedHeartStore.getState().setTree(tree)
    useSeedHeartStore.getState().clearTree()
    expect(useSeedHeartStore.getState().tree).toBeNull()
  })

  it('setHovered and setSelected update interaction state', () => {
    useSeedHeartStore.getState().setHovered('n1')
    useSeedHeartStore.getState().setSelected('n2')
    const s = useSeedHeartStore.getState()
    expect(s.hoveredId).toBe('n1')
    expect(s.selectedId).toBe('n2')
  })

  it('openPanel and closePanel toggle isPanelOpen', () => {
    useSeedHeartStore.getState().openPanel()
    expect(useSeedHeartStore.getState().isPanelOpen).toBe(true)
    useSeedHeartStore.getState().closePanel()
    expect(useSeedHeartStore.getState().isPanelOpen).toBe(false)
  })

  it('setActiveMode switches visualization mode', () => {
    useSeedHeartStore.getState().setActiveMode('crystal')
    expect(useSeedHeartStore.getState().activeMode).toBe('crystal')
  })
})
