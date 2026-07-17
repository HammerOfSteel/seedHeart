import { useRef } from 'react'
import { useSeedHeartStore } from '@/store/useSeedHeartStore'
import { exportToJSON, importFromJSON, downloadFile, readFileAsText } from '@/graph/exportImport'
import { buildTree } from '@/graph/TreeBuilder'
import { layoutTree } from '@/graph/TreeLayout'
import { SHOWCASE_RAW } from '@/graph/showcaseFixture'

/**
 * Compact toolbar for loading the showcase tree, exporting the current tree as JSON,
 * and importing a previously exported JSON file.
 */
export function ImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tree = useSeedHeartStore((s) => s.tree)
  const setTree = useSeedHeartStore((s) => s.setTree)
  const setError = useSeedHeartStore((s) => s.setError)

  const handleLoadShowcase = () => {
    setTree(layoutTree(buildTree(SHOWCASE_RAW)))
  }

  const handleExport = () => {
    if (!tree) return
    const json = exportToJSON(tree)
    const rootLabel = tree.nodes[tree.rootId]?.label ?? 'seedheart-tree'
    const filename = rootLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    downloadFile(json, `${filename}.json`, 'application/json')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    readFileAsText(file)
      .then((text) => {
        const imported = importFromJSON(text)
        setTree(imported)
        setError(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Import failed: ${msg}`)
      })
      .finally(() => {
        // Reset so the same file can be re-imported
        if (fileInputRef.current) fileInputRef.current.value = ''
      })
  }

  const btnBase =
    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-150 select-none'
  const btnPrimary = `${btnBase} bg-white/10 hover:bg-white/20 text-white/80 border border-white/10`
  const btnDisabled = `${btnBase} bg-white/5 text-white/25 cursor-not-allowed border border-white/5`

  return (
    <div className="flex items-center gap-1.5">
      <button
        className={btnPrimary}
        onClick={handleLoadShowcase}
        aria-label="Load showcase tree"
        title="Load showcase"
      >
        ✦ Showcase
      </button>

      <button
        className={tree ? btnPrimary : btnDisabled}
        onClick={handleExport}
        disabled={!tree}
        aria-label="Export current tree as JSON"
        title={tree ? 'Export JSON' : 'No tree loaded'}
      >
        ↓ Export
      </button>

      <button
        className={btnPrimary}
        onClick={handleImportClick}
        aria-label="Import tree from JSON file"
        title="Import JSON"
      >
        ↑ Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
