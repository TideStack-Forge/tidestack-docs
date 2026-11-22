import {createHash} from 'node:crypto'
import {mkdir, readFile, readdir, rename, rm, stat, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseDrawio, parseXml, render} from '@dskripchenko/drawio'
import {embedDiagramTheme} from './sync-diagram-styles.mjs'

const scriptPath = fileURLToPath(import.meta.url)
const defaultHandbookRoot = path.resolve(path.dirname(scriptPath), '..')
const renderer = '@dskripchenko/drawio@0.1.0'
const digest = value => createHash('sha256').update(value).digest('hex')
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

async function readOptional(file) {
  try {
    return await readFile(file, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function sourcesIn(directory, prefix = '') {
  const files = []
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const relative = path.posix.join(prefix, entry.name)
    if (entry.isDirectory()) files.push(...await sourcesIn(path.join(directory, entry.name), relative))
    else if (/\.(drawio|html)$/.test(entry.name)) files.push(relative)
  }
  return files.sort()
}

function paletteFrom(css) {
  const light = css.match(/\.ts-diagram\s*\{([^}]+)\}/)?.[1]
  if (!light) throw new Error('Diagram theme has no .ts-diagram palette')
  const colors = new Map()
  for (const match of light.matchAll(/(--diagram-[\w-]+):\s*(#[\da-f]{6});/gi)) {
    colors.set(match[2].toLowerCase(), match[1])
  }
  // These shared colors occur under several roles in the palette.
  colors.set('#ffffff', '--diagram-paper')
  colors.set('#0f172a', '--diagram-ink')
  return colors
}

function themeSvgContent(svg, css) {
  // Embedded image documents cannot inherit the surrounding SVG's theme variables.
  // Keep their vector geometry in the same document and preserve the image viewport.
  let themed = svg.replace(/<image\b([^>]*?)\/>/g, (image, attributes) => {
    const uri = attributes.match(/\bhref="(data:image\/svg\+xml(?:;base64)?,[^"]+)"/)?.[1]
    if (!uri) return image
    const comma = uri.indexOf(',')
    const decoded = uri.slice(0, comma).endsWith(';base64')
      ? Buffer.from(uri.slice(comma + 1), 'base64').toString('utf8')
      : decodeURIComponent(uri.slice(comma + 1))
    const embedded = decoded.match(/<svg\b[\s\S]*<\/svg>/)?.[0]
    if (!embedded) throw new Error('Embedded SVG image has no SVG root')
    const viewport = [...attributes.matchAll(/\b(x|y|width|height|preserveAspectRatio)="[^"]*"/g)]
      .map(match => match[0]).join(' ')
    return embedded.replace(/<svg\b([^>]*)>/, (_root, embeddedAttributes) => {
      const ownAttributes = embeddedAttributes.replace(/\s+(x|y|width|height|preserveAspectRatio)="[^"]*"/g, '')
      return `<svg${ownAttributes} ${viewport}>`
    })
  })
  const colors = paletteFrom(css)
  themed = themed.replace(/\b(fill|stroke|stop-color)="(#[\da-f]{6})"/gi, (attribute, name, color) => {
    const token = colors.get(color.toLowerCase())
    return token ? `${name}="var(${token})"` : attribute
  })
  return themed
}

function previewHtml(svg, title, css) {
  const blocks = [...css.matchAll(/\.ts-diagram\s*\{([^}]+)\}/g)]
  const overrides = blocks.slice(0, 2).map((match, index) =>
    `html[data-theme="${index === 0 ? 'light' : 'dark'}"] .ts-diagram {${match[1]}}`,
  ).join('\n')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeXml(title)}</title><style>html,body{margin:0}.diagram-container{width:100%;overflow:auto}.diagram-container>svg{display:block;width:100%;height:auto;min-width:0}${overrides}</style></head><body><main class="diagram-container">${svg}</main></body></html>\n`
}

export function renderDiagram(source, relative, css) {
  if (relative.endsWith('.html')) {
    const figure = source.match(/<svg\b[\s\S]*?<\/svg>/)?.[0]
    if (!figure) throw new Error(`${relative} has no inline SVG`)
    const svg = `${embedDiagramTheme(themeSvgContent(figure, css), css)}\n`
    const document = parseXml(svg)
    const title = document.root.children.find(node => node.kind === 'element' && node.local === 'title')
    const text = title?.children.filter(node => node.kind === 'text').map(node => node.value).join('') ?? path.basename(relative, '.html')
    return {svg, html: previewHtml(svg.trim(), text, css)}
  }
  const model = parseDrawio(source)
  if (model.pages.length !== 1) throw new Error(`${relative} must contain exactly one page`)
  const result = render(model, {page: 0, idPrefix: `diagram-${path.basename(relative, '.drawio')}`})
  if (result.warnings.length) throw new Error(`${relative}: ${result.warnings.join('\n')}`)
  let svg = themeSvgContent(result.svg, css)
  // Cell IDs are the source of stable fragment links used by the capability table.
  svg = svg.replace(/<g\b([^>]*\bdata-cell-id="([^"]+)"[^>]*?)(\/?)>/g, (_tag, attributes, id, closing) => `<g${attributes} id="${id}"${closing}>`)
  svg = svg.replace(/<svg\b([^>]*)>/, (_tag, attributes) => {
    const classes = attributes.replace(/class="([^"]*)"/, 'class="$1 ts-diagram"')
    return `<svg${classes} data-source="docs/diagrams/${escapeXml(relative)}">`
  })
  const licenses = [...source.matchAll(/<!--[\s\S]*?-->/g)].map(match => match[0]).join('\n')
  const [x, y] = svg.match(/viewBox="([^"]+)"/)[1].split(' ')
  const canvas = `<rect x="${x}" y="${y}" width="${result.width}" height="${result.height}" fill="var(--diagram-canvas)"/>`
  svg = svg.replace(/(<svg\b[^>]*>)/, `$1${licenses}${canvas}`)
  svg = `${embedDiagramTheme(svg, css)}\n`
  try {
    parseXml(svg)
  } catch (error) {
    throw new Error(`${relative}: ${error.message}`, {cause: error})
  }
  return {svg, html: previewHtml(svg.trim(), result.pages[0], css)}
}

async function atomicWrite(file, value) {
  await mkdir(path.dirname(file), {recursive: true})
  const temporary = `${file}.${process.pid}.tmp`
  await writeFile(temporary, value)
  await rename(temporary, file)
}

export async function buildDiagrams({handbookRoot = defaultHandbookRoot, sourceRoot = path.resolve(handbookRoot, '../diagrams'), check = false} = {}) {
  const outputRoot = path.join(handbookRoot, 'docs/.assets/diagrams')
  const manifestPath = path.join(outputRoot, 'manifest.json')
  const manifestText = await readOptional(manifestPath)
  const previous = manifestText ? JSON.parse(manifestText) : null
  const css = await readFile(path.join(handbookRoot, 'src/css/diagrams.css'), 'utf8')
  const generatorHash = digest(Buffer.concat([
    await readFile(scriptPath),
    await readFile(path.join(path.dirname(scriptPath), 'sync-diagram-styles.mjs')),
  ]))
  const themeHash = digest(css)
  const sourceExists = await stat(sourceRoot).catch(error => {
    if (error.code === 'ENOENT') return null
    throw error
  })

  if (!sourceExists) {
    if (!previous) throw new Error('Diagram sources and generated manifest are both missing')
    if (previous.generatorHash !== generatorHash || previous.themeHash !== themeHash || previous.renderer !== renderer) {
      throw new Error('Generated diagrams need refreshing from the platform repository')
    }
    for (const entry of previous.diagrams) {
      for (const [extension, expectedHash] of Object.entries(entry.outputs)) {
        const content = await readFile(path.join(outputRoot, entry.name.replace(/\.(drawio|html)$/, `.${extension}`)))
        if (digest(content) !== expectedHash) throw new Error(`Generated diagram changed: ${entry.name} (${extension})`)
      }
    }
    return {count: previous.diagrams.length, standalone: true}
  }

  const sources = await sourcesIn(sourceRoot)
  if (!sources.length) throw new Error('No diagram sources found in docs/diagrams')
  const outputs = new Map()
  const diagrams = []
  // Finish rendering every source before replacing any published asset.
  for (const name of sources) {
    const source = await readFile(path.join(sourceRoot, name), 'utf8')
    const generated = renderDiagram(source, name, css)
    const hashes = {}
    for (const [extension, value] of Object.entries(generated)) {
      const outputName = name.replace(/\.(drawio|html)$/, `.${extension}`)
      if (outputs.has(outputName)) throw new Error(`Diagram sources share the same output path: ${outputName}`)
      outputs.set(outputName, value)
      hashes[extension] = digest(value)
    }
    diagrams.push({name, sourceHash: digest(source), outputs: hashes})
  }
  const manifest = `${JSON.stringify({renderer, generatorHash, themeHash, diagrams}, null, 2)}\n`
  if (check) {
    if (manifestText !== manifest) throw new Error('Diagram sources or generation settings changed. Run npm run build:diagrams')
    for (const [name, value] of outputs) {
      if (await readOptional(path.join(outputRoot, name)) !== value) throw new Error(`Generated diagram is stale: ${name}`)
    }
  } else {
    for (const [name, value] of outputs) await atomicWrite(path.join(outputRoot, name), value)
    for (const entry of previous?.diagrams ?? []) {
      if (!sources.includes(entry.name)) {
        for (const extension of ['svg', 'html']) {
          const name = entry.name.replace(/\.(drawio|html)$/, `.${extension}`)
          if (!outputs.has(name)) await rm(path.join(outputRoot, name), {force: true})
        }
      }
    }
    await atomicWrite(manifestPath, manifest)
  }
  return {count: sources.length, standalone: false}
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const result = await buildDiagrams({check: process.argv.includes('--check')})
    console.log(`${process.argv.includes('--check') || result.standalone ? 'Checked' : 'Generated'} ${result.count} diagrams${result.standalone ? ' from standalone handbook assets' : ' from docs/diagrams'}.`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
