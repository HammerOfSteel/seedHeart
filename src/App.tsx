import { CanvasHost } from '@/components/CanvasHost'
import { ModeSwitcher } from '@/components/ModeSwitcher'
import { SeedInput } from '@/components/SeedInput'
import { NodeDetailPanel } from '@/components/NodeDetailPanel'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'

export default function App() {
  const error = useSeedHeartStore((s) => s.error)

  const handleGrow = (_idea: string) => {
    // Phase 7 will wire in the actual AI call
    // For now, load the fixture tree to verify the UI renders
    import('@/graph/fixtures').then(({ FIXTURE_RAW }) =>
      import('@/graph/TreeBuilder').then(({ buildTree }) =>
        import('@/graph/TreeLayout').then(({ layoutTree }) => {
          const tree = layoutTree(buildTree(FIXTURE_RAW))
          useSeedHeartStore.getState().setTree(tree)
          useSeedHeartStore.getState().setGenerating(false)
        }),
      ),
    )
    useSeedHeartStore.getState().setGenerating(true)
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
