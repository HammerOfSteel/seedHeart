import type { IRenderer } from '@/engine/IRenderer'
import type { MemeTree, NodeId, MemeNode } from '@/graph/types'
import { PALETTE } from '@/constants'
import { layoutTree } from '@/graph/TreeLayout'

const P = PALETTE.mandala

// Angular velocities for each ring layer (radians per frame at 60fps)
const RING_OMEGAS = [0, 0.0002, -0.00015, 0.0001, -0.00008]

/**
 * Living Mandala — 2D Canvas renderer.
 *
 * Visual: concentric rings rotating at different speeds; nodes breathe with
 * sin(time+phase); sub-tree selected nodes bloom as nested mini-mandalas;
 * Fibonacci spiral on background OffscreenCanvas.
 */
export class MandalaRenderer implements IRenderer {
  private container: HTMLElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private bgCanvas: OffscreenCanvas | null = null
  private frameId: number | null = null
  private tree: MemeTree | null = null
  private hoveredId: NodeId | null = null
  private selectedId: NodeId | null = null
  private ringAngles: number[] = RING_OMEGAS.map(() => 0)
  private time = 0
  private bloomScale = new Map<NodeId, number>() // 0..1 for sub-mandala bloom

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
    this.bloomScale.clear()
  }

  onHover(id: NodeId | null): void {
    this.hoveredId = id
  }

  onSelect(id: NodeId | null): void {
    this.selectedId = id
    if (id) {
      // Trigger bloom animation for selected node
      this.bloomScale.set(id, 0)
    }
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    if (this.canvas && this.container) this.container.removeChild(this.canvas)
    this.canvas = null
    this.ctx = null
    this.bgCanvas = null
    this.container = null
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private resize(): void {
    if (!this.canvas || !this.container) return
    const w = this.container.clientWidth || window.innerWidth
    const h = this.container.clientHeight || window.innerHeight
    this.canvas.width = w
    this.canvas.height = h
    this.buildFibonacciBackground(w, h)
  }

  private buildFibonacciBackground(w: number, h: number): void {
    if (typeof OffscreenCanvas === 'undefined') return
    this.bgCanvas = new OffscreenCanvas(w, h)
    const ctx = this.bgCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D
    if (!ctx) return

    ctx.fillStyle = P.background
    ctx.fillRect(0, 0, w, h)

    // Fibonacci spiral arcs
    const cx = w / 2
    const cy = h / 2
    let a = 0
    let b = 1
    ctx.strokeStyle = P.ring + '20'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 18; i++) {
      const r = (a + b) * Math.min(w, h) * 0.003
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ;[a, b] = [b, a + b]
    }
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop())
    this.time += 0.016

    // Advance ring rotations
    for (let i = 0; i < this.ringAngles.length; i++) {
      this.ringAngles[i] += RING_OMEGAS[i] * 1000 // multiply by 1000 for visible effect
    }

    // Advance bloom animations (easeOutBack)
    this.bloomScale.forEach((v, id) => {
      if (v < 1) this.bloomScale.set(id, Math.min(1, v + 0.05))
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
    const cx = w / 2
    const cy = h / 2

    // Draw Fibonacci background
    if (this.bgCanvas) {
      ctx.drawImage(this.bgCanvas, 0, 0)
    } else {
      ctx.fillStyle = P.background
      ctx.fillRect(0, 0, w, h)
    }

    const maxDepth = Math.max(...Object.values(tree.nodes).map((n) => n.depth), 1)
    const ringRadius = Math.min(w, h) * 0.38

    // Group nodes by depth ring
    const rings: Record<number, MemeNode[]> = {}
    for (const node of Object.values(tree.nodes)) {
      if (!rings[node.depth]) rings[node.depth] = []
      rings[node.depth].push(node)
    }

    // Draw concentric ring guides
    for (let depth = 0; depth <= maxDepth; depth++) {
      const r = (depth / maxDepth) * ringRadius
      if (r < 1) continue
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = P.ring + '30'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Draw edges
    for (const edge of tree.edges) {
      const src = tree.nodes[edge.sourceId]
      const tgt = tree.nodes[edge.targetId]
      if (!src || !tgt) continue

      const { px: sx, py: sy } = this.ringProject(src, rings, maxDepth, ringRadius, cx, cy)
      const { px: tx, py: ty } = this.ringProject(tgt, rings, maxDepth, ringRadius, cx, cy)

      // Cubic bezier curving toward centre
      const cp1x = sx + (cx - sx) * 0.3
      const cp1y = sy + (cy - sy) * 0.3
      const cp2x = tx + (cx - tx) * 0.3
      const cp2y = ty + (cy - ty) * 0.3

      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty)
      ctx.strokeStyle = P.edge
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.4
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Draw nodes on rings
    for (const node of Object.values(tree.nodes)) {
      const { px, py } = this.ringProject(node, rings, maxDepth, ringRadius, cx, cy)
      const isHovered = node.id === this.hoveredId
      const isSelected = node.id === this.selectedId

      // Breathing radius
      const breathe = 1 + 0.12 * Math.sin(this.time * 2 + node.x * 0.5)
      const r = (isHovered ? 9 : isSelected ? 11 : 6) * breathe

      const color = isSelected ? P.nodeHover : isHovered ? P.nodeHover : P.node

      // Outer glow
      ctx.beginPath()
      ctx.arc(px, py, r * 1.8, 0, Math.PI * 2)
      const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 1.8)
      glow.addColorStop(0, color + '88')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fill()

      // Node dot
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Sub-mandala bloom on selected
      if (isSelected && this.bloomScale.has(node.id)) {
        this.drawMiniMandala(ctx, px, py, r, this.bloomScale.get(node.id) ?? 0)
      }

      // Label
      ctx.font = `${Math.max(8, 11 - node.depth)}px sans-serif`
      ctx.fillStyle = color
      ctx.globalAlpha = 0.9
      ctx.fillText(node.label, px + r + 3, py + 3)
      ctx.globalAlpha = 1
    }
  }

  /** Map a node to its polar position on its depth ring. */
  private ringProject(
    node: MemeNode,
    rings: Record<number, MemeNode[]>,
    maxDepth: number,
    ringRadius: number,
    cx: number,
    cy: number,
  ): { px: number; py: number } {
    const ring = rings[node.depth] ?? [node]
    const idx = ring.findIndex((n) => n.id === node.id)
    const baseAngle = (idx / ring.length) * Math.PI * 2
    const rotAngle = baseAngle + (this.ringAngles[node.depth] ?? 0)
    const r = maxDepth === 0 ? 0 : (node.depth / maxDepth) * ringRadius
    return {
      px: cx + Math.cos(rotAngle) * r,
      py: cy + Math.sin(rotAngle) * r,
    }
  }

  private drawMiniMandala(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    baseR: number,
    scale: number,
  ): void {
    // easeOutBack scale
    const s = easeOutBack(scale)
    const petals = 8
    const outerR = baseR * 5 * s
    ctx.save()
    ctx.translate(x, y)
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(
        Math.cos(angle) * outerR * 0.5,
        Math.sin(angle) * outerR * 0.5,
        outerR * 0.3,
        0,
        Math.PI * 2,
      )
      ctx.strokeStyle = P.nodeHover + 'aa'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    ctx.restore()
  }
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
