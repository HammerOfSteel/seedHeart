import type { IRenderer } from './IRenderer'
import type { MemeTree, NodeId } from '@/graph/types'
import type { VisualizationMode } from '@/constants'
import { RENDERER_FADE_DURATION_MS } from '@/constants'

type RendererFactory = (container: HTMLElement) => IRenderer

/**
 * Manages lifecycle and switching between IRenderer implementations.
 *
 * Switching flow:
 *  1. Fade out current renderer (CSS opacity transition)
 *  2. dispose() old renderer
 *  3. Construct + mount new renderer
 *  4. render(lastTree) on new renderer
 *  5. Fade in
 */
export class RendererManager {
  private current: IRenderer | null = null
  private currentMode: VisualizationMode | null = null
  private container: HTMLElement
  private factories: Map<VisualizationMode, RendererFactory> = new Map()
  private lastTree: MemeTree | null = null
  private hoveredId: NodeId | null = null
  private selectedId: NodeId | null = null

  constructor(container: HTMLElement) {
    this.container = container
    // Apply the fade wrapper style once
    this.container.style.transition = `opacity ${RENDERER_FADE_DURATION_MS}ms ease`
    this.container.style.opacity = '1'
  }

  /** Register a factory for a given mode. Call before switchTo(). */
  register(mode: VisualizationMode, factory: RendererFactory): this {
    this.factories.set(mode, factory)
    return this
  }

  /** Switch to a new visualization mode, disposing the previous renderer. */
  async switchTo(mode: VisualizationMode): Promise<void> {
    if (mode === this.currentMode) return

    const factory = this.factories.get(mode)
    if (!factory) throw new Error(`No renderer registered for mode: ${mode}`)

    // Fade out
    this.container.style.opacity = '0'
    await delay(RENDERER_FADE_DURATION_MS)

    // Dispose old
    this.current?.dispose()
    this.current = null
    this.currentMode = null

    // Mount new
    const renderer = factory(this.container)
    renderer.mount(this.container)
    if (this.lastTree) renderer.render(this.lastTree)
    if (this.hoveredId) renderer.onHover(this.hoveredId)
    if (this.selectedId) renderer.onSelect(this.selectedId)

    this.current = renderer
    this.currentMode = mode

    // Fade in
    this.container.style.opacity = '1'
  }

  /** Push a new tree to the active renderer. */
  renderTree(tree: MemeTree): void {
    this.lastTree = tree
    this.current?.render(tree)
  }

  onHover(id: NodeId | null): void {
    this.hoveredId = id
    this.current?.onHover(id)
  }

  onSelect(id: NodeId | null): void {
    this.selectedId = id
    this.current?.onSelect(id)
  }

  get activeMode(): VisualizationMode | null {
    return this.currentMode
  }

  /** Dispose the active renderer and clean up. */
  dispose(): void {
    this.current?.dispose()
    this.current = null
    this.currentMode = null
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
