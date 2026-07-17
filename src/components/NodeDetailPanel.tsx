import { useSeedHeartStore } from '@/store/useSeedHeartStore'

interface NodeDetailPanelProps {
  onRegenerate: (nodeId: string) => void
}

/**
 * Slide-in panel showing the selected node's content.
 */
export function NodeDetailPanel({ onRegenerate }: NodeDetailPanelProps) {
  const tree = useSeedHeartStore((s) => s.tree)
  const selectedId = useSeedHeartStore((s) => s.selectedId)
  const isPanelOpen = useSeedHeartStore((s) => s.isPanelOpen)
  const closePanel = useSeedHeartStore((s) => s.closePanel)
  const setSelected = useSeedHeartStore((s) => s.setSelected)

  const node = selectedId && tree ? tree.nodes[selectedId] : null

  const handleClose = () => {
    closePanel()
    setSelected(null)
  }

  const handleCopy = () => {
    if (node) navigator.clipboard.writeText(node.content)
  }

  const isLeaf = node ? node.children.length === 0 : false

  return (
    <div
      className={[
        'fixed right-0 top-0 h-full w-80 bg-black/60 backdrop-blur-xl',
        'border-l border-white/10 flex flex-col p-6 gap-4',
        'transition-transform duration-300',
        isPanelOpen && node ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-white font-semibold text-lg leading-snug">{node?.label ?? ''}</h2>
        <button
          onClick={handleClose}
          className="text-white/40 hover:text-white/80 text-xl leading-none mt-0.5 shrink-0"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Depth badge */}
      {node && (
        <span className="self-start text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
          Depth {node.depth} · {isLeaf ? 'Leaf' : 'Branch'}
        </span>
      )}

      {/* Content */}
      <p className="text-white/70 text-sm leading-relaxed flex-1 overflow-y-auto">
        {node?.content ?? ''}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 py-2 rounded-xl text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
        >
          Copy
        </button>
        {isLeaf && node && (
          <button
            onClick={() => onRegenerate(node.id)}
            className="flex-1 py-2 rounded-xl text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            ↺ Regenerate
          </button>
        )}
      </div>
    </div>
  )
}
