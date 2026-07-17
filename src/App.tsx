import { useEffect } from 'react'
import { CanvasHost } from '@/components/CanvasHost'
import { ModeSwitcher } from '@/components/ModeSwitcher'
import { SeedInput } from '@/components/SeedInput'
import { NodeDetailPanel } from '@/components/NodeDetailPanel'
import { ImportExport } from '@/components/ImportExport'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'
import { LMStudioClient } from '@/ai/LMStudioClient'
import { generateMemeTree } from '@/ai/generateMemeTree'
import { buildTree } from '@/graph/TreeBuilder'
import { layoutTree } from '@/graph/TreeLayout'
import { SHOWCASE_RAW } from '@/graph/showcaseFixture'

const client = new LMStudioClient()

export default function App() {
  const error = useSeedHeartStore((s) => s.error)

  // Load the showcase tree on first render so the visualizer isn't empty
  useEffect(() => {
    useSeedHeartStore.getState().setTree(layoutTree(buildTree(SHOWCASE_RAW)))
  }, [])

  const handleGrow = (idea: string) => {
    const store = useSeedHeartStore.getState()
    store.setGenerating(true)
    store.setError(null)

    generateMemeTree(client, idea)
      .then((tree) => {
        store.setTree(tree)
        store.setGenerating(false)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        store.setError(msg)
        store.setGenerating(false)
        // Fall back to showcase so the UI always renders something
        store.setTree(layoutTree(buildTree(SHOWCASE_RAW)))
      })
  }

  const handleRegenerate = (_nodeId: string) => {
    // Phase 9 — per-leaf regeneration
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06040f]">
      {/* Full-screen renderer canvas */}
      <CanvasHost />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <span className="text-white/60 text-sm font-light tracking-[0.3em] uppercase select-none">
          SeedHeart
        </span>
        <div className="flex items-center gap-3">
          <ImportExport />
          <ModeSwitcher />
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-red-900/70 backdrop-blur text-red-200 text-xs px-4 py-2 rounded-xl border border-red-500/30">
          {error}
        </div>
      )}

      {/* Seed input — bottom centre */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <SeedInput onGrow={handleGrow} />
      </div>

      {/* Node detail panel */}
      <NodeDetailPanel onRegenerate={handleRegenerate} />
    </div>
  )
}
