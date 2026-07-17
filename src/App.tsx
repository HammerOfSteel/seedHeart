import { CanvasHost } from '@/components/CanvasHost'
import { ModeSwitcher } from '@/components/ModeSwitcher'
import { SeedInput } from '@/components/SeedInput'
import { NodeDetailPanel } from '@/components/NodeDetailPanel'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'
import { LMStudioClient } from '@/ai/LMStudioClient'
import { generateMemeTree } from '@/ai/generateMemeTree'

const client = new LMStudioClient()

export default function App() {
  const error = useSeedHeartStore((s) => s.error)

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

        // Fall back to fixture so the UI still renders
        import('@/graph/fixtures').then(({ FIXTURE_RAW }) =>
          import('@/graph/TreeBuilder').then(({ buildTree }) =>
            import('@/graph/TreeLayout').then(({ layoutTree }) => {
              store.setTree(layoutTree(buildTree(FIXTURE_RAW)))
            }),
          ),
        )
      })
  }

  const handleRegenerate = (_nodeId: string) => {
    // Phase 7
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
        <ModeSwitcher />
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
