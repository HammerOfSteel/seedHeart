import { useEffect, useRef } from 'react'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'
import { RendererManager } from '@/engine/RendererManager'
import { MyceliumRenderer } from '@/engine/renderers/MyceliumRenderer'
import { CrystalRenderer } from '@/engine/renderers/CrystalRenderer'
import { InkRenderer } from '@/engine/renderers/InkRenderer'
import { CircuitRenderer } from '@/engine/renderers/CircuitRenderer'
import { MandalaRenderer } from '@/engine/renderers/MandalaRenderer'
import type { VisualizationMode } from '@/constants'

/**
 * Full-screen canvas host that owns the RendererManager lifecycle.
 * Bridges React state to the imperative renderer layer.
 */
export function CanvasHost() {
  const containerRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<RendererManager | null>(null)

  const activeMode = useSeedHeartStore((s) => s.activeMode)
  const tree = useSeedHeartStore((s) => s.tree)
  const hoveredId = useSeedHeartStore((s) => s.hoveredId)
  const selectedId = useSeedHeartStore((s) => s.selectedId)

  // Initialise RendererManager once
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const manager = new RendererManager(container)
    manager.register('mycelium', () => new MyceliumRenderer())
    manager.register('crystal', () => new CrystalRenderer())
    manager.register('ink', () => new InkRenderer())
    manager.register('circuit', () => new CircuitRenderer())
    manager.register('mandala', () => new MandalaRenderer())
    managerRef.current = manager

    return () => {
      manager.dispose()
      managerRef.current = null
    }
  }, [])

  // Switch mode when activeMode changes
  useEffect(() => {
    managerRef.current?.switchTo(activeMode as VisualizationMode)
  }, [activeMode])

  // Push tree updates
  useEffect(() => {
    if (tree) managerRef.current?.renderTree(tree)
  }, [tree])

  // Forward hover
  useEffect(() => {
    managerRef.current?.onHover(hoveredId)
  }, [hoveredId])

  // Forward selection
  useEffect(() => {
    managerRef.current?.onSelect(selectedId)
  }, [selectedId])

  return <div ref={containerRef} className="absolute inset-0" style={{ overflow: 'hidden' }} />
}
