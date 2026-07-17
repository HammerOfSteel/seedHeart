import type { MemeTree, NodeId } from '@/graph/types'

/**
 * Strategy interface that every visualization renderer must implement.
 * Renderers are mounted into a host HTMLElement and receive the meme tree
 * as their primary data source.
 */
export interface IRenderer {
  /**
   * Mount into the given container element. Called once after construction.
   * The renderer owns its own canvas / WebGL context.
   */
  mount(container: HTMLElement): void

  /**
   * Render (or re-render) the provided meme tree.
   * May be called multiple times if the tree is updated.
   */
  render(tree: MemeTree): void

  /** Called when the pointer hovers over a node. Pass null to clear. */
  onHover(id: NodeId | null): void

  /** Called when the user clicks / selects a node. Pass null to deselect. */
  onSelect(id: NodeId | null): void

  /** Tear down — release GPU resources, remove DOM nodes, cancel animation frames. */
  dispose(): void
}
