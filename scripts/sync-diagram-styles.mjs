import {readdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const families = ['neutral', 'blue', 'teal', 'sky', 'violet', 'indigo', 'rose', 'orange']
const fills = '<defs id="handbook-diagram-fills">' + families.map(family =>
  `<linearGradient id="handbook-wash-${family}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--diagram-${family}-surface)"/><stop offset="1" stop-color="var(--diagram-paper)"/></linearGradient>`,
).join('') + '<pattern id="handbook-rail-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6" fill="var(--diagram-muted)"/></pattern></defs>'

async function diagramFiles(directory) {
  const entries = await readdir(directory, {withFileTypes: true})
  const nested = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) return diagramFiles(file)
    return /\.(svg|html)$/.test(entry.name) ? [file] : []
  }))
  return nested.flat().sort()
}

/** Embed the canonical theme in opted-in SVGs and their HTML editing sources. */
export async function syncDiagramStyles(handbookRoot, {check = false} = {}) {
  const css = await readFile(path.join(handbookRoot, 'src/css/diagrams.css'), 'utf8')
  const theme = `<style id="handbook-diagram-theme">${css}</style>${fills}`
  const changed = []
  for (const file of await diagramFiles(path.join(handbookRoot, 'docs'))) {
    const source = await readFile(file, 'utf8')
    if (!/<svg\b[^>]*class="[^"]*\bts-diagram\b/.test(source)) continue
    const withoutFills = source.replace(/<defs id="handbook-diagram-fills">[\s\S]*?<\/defs>/, '')
    const previousTheme = /<style id="handbook-diagram-theme">[\s\S]*?<\/style>/
    const next = previousTheme.test(withoutFills)
      ? withoutFills.replace(previousTheme, () => theme)
      : /<defs\b[^>]*>/.test(withoutFills)
        ? withoutFills.replace(/<defs\b[^>]*>/, (defs) => defs + theme)
        : withoutFills.replace(/<svg\b[^>]*>/, (svg) => `${svg}<defs>${theme}</defs>`)
    if (source === next) continue
    changed.push(path.relative(handbookRoot, file))
    if (!check) await writeFile(file, next)
  }
  return changed
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const handbookRoot = fileURLToPath(new URL('..', import.meta.url))
  const check = process.argv.includes('--check')
  const changed = await syncDiagramStyles(handbookRoot, {check})
  if (check && changed.length) {
    console.error(`Diagram styles are out of sync. Run npm run sync:diagrams:\n${changed.join('\n')}`)
    process.exitCode = 1
  } else {
    console.log(check ? 'Diagram styles are synchronized.' : `Updated ${changed.length} diagram files.`)
  }
}
