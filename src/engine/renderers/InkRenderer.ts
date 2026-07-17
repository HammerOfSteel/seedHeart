import type { IRenderer } from '@/engine/IRenderer'
import type { MemeTree, NodeId } from '@/graph/types'
import { PALETTE } from '@/constants'
import { layoutTree } from '@/graph/TreeLayout'

const P = PALETTE.ink

/**
 * Ink Diffusion — 2D Canvas renderer.
 *
 * Visual: noise-generated parchment background; nodes bloom as ink-drop circles
 * with feathered edges; connections bleed as watercolour arcs; labels write
 * themselves character by character.
 */
export class InkRenderer implements IRenderer {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private frameId: number | null = null
  private tree: MemeTree | null = null
  private hoveredId: NodeId | null = null
  private selectedId: NodeId | null = null
  private labelProgress = new Map<NodeId, number>() // 0..1 char reveal
  private time = 0

  mount(container: HTMLElement): void {
    this.container = container
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;'
    container.appendChild(canvas)
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.resize()
    this.loop()
  }

  render(tree: MemeTree): void {
    this.tree = layoutTree(tree)
    this.labelProgress.clear()
    // Stagger label reveals
    Object.keys(this.tree.nodes).forEach((id, i) => {
      setTimeout(() => this.labelProgress.set(id, 0), i * 120)
    })
  }

  onHover(id: NodeId | null): void {
    this.hoveredId = id
  }

  onSelect(id: NodeId | null): void {
    this.selectedId = id
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    if (this.canvas && this.container) this.container.removeChild(this.canvas)
    this.canvas = null
    this.ctx = null
    this.container = null
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private resize(): void {
    if (!this.canvas || !this.container) return
    this.canvas.width = this.container.clientWidth || window.innerWidth
    this.canvas.height = this.container.clientHeight || window.innerHeight
    this.drawParchment()
  }

  private drawParchment(): void {
    const ctx = this.ctx
    const canvas = this.canvas
    if (!ctx || !canvas) return

    // Warm parchment base
    ctx.fillStyle = P.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Noise texture — random dark speckles for aged paper feel
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const alpha = Math.random() * 0.04
      ctx.fillStyle = `rgba(80,50,20,${alpha})`
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop())
    this.time += 0.016
    this.draw()

    // Advance label progress
    this.labelProgress.forEach((v, id) => {
      if (v < 1) this.labelProgress.set(id, Math.min(1, v + 0.04))
    })
  }

  private draw(): void {
    const ctx = this.ctx
    const canvas = this.canvas
    const tree = this.tree
    if (!ctx || !canvas || !tree) return

    // Check resize
    if (canvas.width !== (this.container?.clientWidth || window.innerWidth)) this.resize()

    const w = canvas.width
    const h = canvas.height

    // Redraw parchment base (partial clear to avoid full repaint every frame)
    ctx.globalAlpha = 0.15
    ctx.fillStyle = P.background
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1

    const cx = w / 2
    const cy = h * 0.25
    const scale = Math.min(w, h) / 35

    // Project 3D → 2D (top-down XZ projection, y used for perspective scale)
    const project = (x: number, y: number, z: number) => ({
      px: cx + (x - 0) * scale,
      py: cy + (z + y * 0.3) * scale * 0.8,
    })

    // Draw edges (watercolour arcs)
    for (const edge of tree.edges) {
      const src = tree.nodes[edge.sourceId]
      const tgt = tree.nodes[edge.targetId]
      if (!src || !tgt) continue

      const p1 = project(src.x, src.y, src.z)
      const p2 = project(tgt.x, tgt.y, tgt.z)
      const mx = (p1.px + p2.px) / 2 + Math.sin(edge.id.length * 3) * 20
      const my = (p1.py + p2.py) / 2 + Math.cos(edge.id.length * 2) * 10

      ctx.beginPath()
      ctx.moveTo(p1.px, p1.py)
      ctx.quadraticCurveTo(mx, my, p2.px, p2.py)
      ctx.strokeStyle = P.edge
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.35
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Draw nodes (ink drop blooms)
    for (const node of Object.values(tree.nodes)) {
      const { px, py } = project(node.x, node.y, node.z)
      const r = Math.max(4, 18 - node.depth * 3)
      const isHovered = node.id === this.hoveredId
      const isSelected = node.id === this.selectedId

      // Ink bloom radial gradient
      const grad = ctx.createRadialGradient(px, py, 0, px, py, r * (isHovered ? 1.6 : 1.2))
      const ink = isSelected ? P.nodeHover : isHovered ? '#5a3a1a' : P.node
      grad.addColorStop(0, ink)
      grad.addColorStop(0.6, ink + 'cc')
      grad.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(px, py, r * (isHovered ? 1.6 : 1.2), 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Label (char-by-char reveal)
      const progress = this.labelProgress.get(node.id) ?? 0
      if (progress > 0) {
        const label = node.label
        const visible = label.slice(0, Math.ceil(label.length * progress))
        ctx.font = `${Math.max(9, 13 - node.depth * 1.5)}px 'Georgia', serif`
        ctx.fillStyle = P.label
        ctx.globalAlpha = progress
        ctx.fillText(visible, px + r + 4, py + 4)
        ctx.globalAlpha = 1
      }
    }
  }
}
