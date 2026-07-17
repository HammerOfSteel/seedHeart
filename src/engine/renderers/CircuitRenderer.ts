import type { IRenderer } from '@/engine/IRenderer'
import type { MemeTree, NodeId } from '@/graph/types'
import { PALETTE } from '@/constants'
import { layoutTree } from '@/graph/TreeLayout'

const P = PALETTE.circuit

/**
 * Neon Circuit — 2D Canvas renderer.
 *
 * Visual: hexagonal nodes on dark PCB background; A*-lite orthogonal routing
 * traces connecting nodes; pulse dots travel along edges; hover triggers
 * corrupted-text glitch effect.
 */
export class CircuitRenderer implements IRenderer {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private frameId: number | null = null
  private tree: MemeTree | null = null
  private hoveredId: NodeId | null = null
  private selectedId: NodeId | null = null
  private pulseOffsets = new Map<string, number>()
  private glitchFrames = new Map<NodeId, number>() // countdown frames for glitch effect
  private time = 0

  private static GLITCH_CHARS = '01!@#$%^&*<>?/\\|{}[]'

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
    this.pulseOffsets.clear()
    this.tree.edges.forEach((e, i) => {
      this.pulseOffsets.set(e.id, i / this.tree!.edges.length)
    })
  }

  onHover(id: NodeId | null): void {
    if (id && id !== this.hoveredId) {
      this.glitchFrames.set(id, 6) // 6-frame glitch burst
    }
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
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop())
    this.time += 0.016

    // Advance pulse offsets
    this.pulseOffsets.forEach((v, id) => {
      this.pulseOffsets.set(id, (v + 0.004) % 1)
    })

    // Decrement glitch counters
    this.glitchFrames.forEach((frames, id) => {
      if (frames <= 0) this.glitchFrames.delete(id)
      else this.glitchFrames.set(id, frames - 1)
    })

    this.draw()
  }

  private draw(): void {
    const ctx = this.ctx
    const canvas = this.canvas
    const tree = this.tree
    if (!ctx || !canvas || !tree) return

    if (canvas.width !== (this.container?.clientWidth || window.innerWidth)) this.resize()

    const w = canvas.width
    const h = canvas.height

    // Dark PCB background
    ctx.fillStyle = P.background
    ctx.fillRect(0, 0, w, h)

    // Faint grid
    ctx.strokeStyle = '#0a1020'
    ctx.lineWidth = 0.5
    const gridSize = 32
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    const cx = w / 2
    const cy = h * 0.3
    const scale = Math.min(w, h) / 36

    const project = (x: number, y: number, z: number) => ({
      px: Math.round((cx + x * scale) / gridSize) * gridSize,
      py: Math.round((cy + (z + y * 0.25) * scale * 0.85) / gridSize) * gridSize,
    })

    // Draw orthogonal routing traces
    for (const edge of tree.edges) {
      const src = tree.nodes[edge.sourceId]
      const tgt = tree.nodes[edge.targetId]
      if (!src || !tgt) continue

      const p1 = project(src.x, src.y, src.z)
      const p2 = project(tgt.x, tgt.y, tgt.z)

      // Manhattan routing: go horizontal then vertical
      ctx.beginPath()
      ctx.moveTo(p1.px, p1.py)
      ctx.lineTo(p2.px, p1.py)
      ctx.lineTo(p2.px, p2.py)
      ctx.strokeStyle = P.edge
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.55
      ctx.stroke()
      ctx.globalAlpha = 1

      // Pulse dot
      const t = this.pulseOffsets.get(edge.id) ?? 0
      // Parameterise along the two segments
      const totalLen = Math.abs(p2.px - p1.px) + Math.abs(p2.py - p1.py)
      const seg1Frac = totalLen > 0 ? Math.abs(p2.px - p1.px) / totalLen : 0.5
      let dotX: number
      let dotY: number
      if (t < seg1Frac) {
        dotX = p1.px + (p2.px - p1.px) * (t / (seg1Frac || 1))
        dotY = p1.py
      } else {
        dotX = p2.px
        dotY = p1.py + (p2.py - p1.py) * ((t - seg1Frac) / (1 - seg1Frac || 1))
      }

      ctx.beginPath()
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2)
      ctx.fillStyle = P.pulse
      ctx.shadowBlur = 8
      ctx.shadowColor = P.pulse
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Draw hexagonal nodes
    for (const node of Object.values(tree.nodes)) {
      const { px, py } = project(node.x, node.y, node.z)
      const r = Math.max(8, 24 - node.depth * 4)
      const isHovered = node.id === this.hoveredId
      const isSelected = node.id === this.selectedId
      const color = isSelected ? P.nodeHover : isHovered ? P.nodeHover : P.node

      this.drawHex(ctx, px, py, r, color)

      // Label (with optional glitch)
      const glitch = this.glitchFrames.has(node.id)
      const rawLabel = node.label
      let displayLabel = rawLabel
      if (glitch) {
        displayLabel = rawLabel
          .split('')
          .map((c) =>
            Math.random() > 0.5
              ? CircuitRenderer.GLITCH_CHARS[
                  Math.floor(Math.random() * CircuitRenderer.GLITCH_CHARS.length)
                ]
              : c,
          )
          .join('')
      }

      ctx.font = `${Math.max(8, 12 - node.depth)}px 'Courier New', monospace`
      ctx.fillStyle = color
      ctx.shadowBlur = glitch ? 12 : 0
      ctx.shadowColor = color
      ctx.fillText(displayLabel, px + r + 4, py + 4)
      ctx.shadowBlur = 0
    }
  }

  private drawHex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string,
  ): void {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      const px = x + r * Math.cos(angle)
      const py = y + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.shadowBlur = 10
    ctx.shadowColor = color
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = P.background + 'cc'
    ctx.fill()
  }
}
