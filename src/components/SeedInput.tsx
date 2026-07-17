import { useState } from 'react'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'

interface SeedInputProps {
  onGrow: (idea: string) => void
}

/**
 * Seed idea input panel — bottom-centre of screen.
 */
export function SeedInput({ onGrow }: SeedInputProps) {
  const seedIdea = useSeedHeartStore((s) => s.seedIdea)
  const setSeedIdea = useSeedHeartStore((s) => s.setSeedIdea)
  const isGenerating = useSeedHeartStore((s) => s.isGenerating)
  const [localValue, setLocalValue] = useState(seedIdea)

  const handleGrow = () => {
    if (!localValue.trim() || isGenerating) return
    setSeedIdea(localValue.trim())
    onGrow(localValue.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGrow()
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-xl shadow-black/40">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Drop a seed idea…"
        disabled={isGenerating}
        className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none min-w-[240px] disabled:opacity-50"
      />
      <button
        onClick={handleGrow}
        disabled={isGenerating || !localValue.trim()}
        className={[
          'px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200',
          isGenerating || !localValue.trim()
            ? 'bg-white/10 text-white/30 cursor-not-allowed'
            : 'bg-white/20 text-white hover:bg-white/30 active:scale-95',
        ].join(' ')}
      >
        {isGenerating ? 'Growing…' : 'Grow'}
      </button>
    </div>
  )
}
