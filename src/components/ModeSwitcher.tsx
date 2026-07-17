import { useSeedHeartStore } from '@/store/useSeedHeartStore'
import { VISUALIZATION_MODES } from '@/constants'
import type { VisualizationMode } from '@/constants'

const MODE_LABELS: Record<VisualizationMode, string> = {
  mycelium: 'Mycelium',
  crystal: 'Crystal',
  ink: 'Ink',
  circuit: 'Circuit',
  mandala: 'Mandala',
}

const MODE_ICONS: Record<VisualizationMode, string> = {
  mycelium: '🕸',
  crystal: '💎',
  ink: '🖋',
  circuit: '⚡',
  mandala: '☯',
}

/**
 * Mode switcher — horizontal pill-buttons in the top-right corner.
 */
export function ModeSwitcher() {
  const activeMode = useSeedHeartStore((s) => s.activeMode)
  const setActiveMode = useSeedHeartStore((s) => s.setActiveMode)

  return (
    <div className="flex gap-2">
      {VISUALIZATION_MODES.map((mode) => (
        <button
          key={mode}
          onClick={() => setActiveMode(mode)}
          title={MODE_LABELS[mode]}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
            'transition-all duration-200 border',
            activeMode === mode
              ? 'bg-white/15 border-white/40 text-white shadow-lg shadow-black/30'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80',
          ].join(' ')}
        >
          <span>{MODE_ICONS[mode]}</span>
          <span className="hidden sm:inline">{MODE_LABELS[mode]}</span>
        </button>
      ))}
    </div>
  )
}
