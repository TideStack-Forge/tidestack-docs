// @vitest-environment node
import {mkdtemp, mkdir, readFile, rename, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, expect, it} from 'vitest'
import {parseXml} from '@dskripchenko/drawio'
import {buildDiagrams, renderDiagram} from './build-diagrams.mjs'

let fixture
let handbookRoot
let sourceRoot
let outputRoot
const drawing = label => `<mxfile><diagram name="Test"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="business-model" value="${label}" vertex="1" parent="1" style="rounded=1;fillColor=#f1f6fc;fontColor=#285988;"><mxGeometry x="20" y="20" width="200" height="60" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`

beforeEach(async () => {
  fixture = await mkdtemp(path.join(tmpdir(), 'handbook-diagram-build-'))
  handbookRoot = path.join(fixture, 'handbook')
  sourceRoot = path.join(fixture, 'diagrams')
  outputRoot = path.join(handbookRoot, 'docs/.assets/diagrams')
  await mkdir(path.join(sourceRoot, 'architecture'), {recursive: true})
  await mkdir(path.join(handbookRoot, 'src/css'), {recursive: true})
  await writeFile(path.join(handbookRoot, 'src/css/diagrams.css'), await readFile(new URL('../src/css/diagrams.css', import.meta.url)))
  await writeFile(path.join(sourceRoot, 'architecture/model.drawio'), drawing('模型 &amp; 运行'))
})

afterEach(async () => {
  await rm(fixture, {recursive: true, force: true})
})

it('generates deterministic assets and detects source changes without rewriting outputs', async () => {
  await buildDiagrams({handbookRoot})
  const svgPath = path.join(outputRoot, 'architecture/model.svg')
  const original = await readFile(svgPath, 'utf8')
  await expect(buildDiagrams({handbookRoot, check: true})).resolves.toMatchObject({count: 1})
  await buildDiagrams({handbookRoot})
  expect(await readFile(svgPath, 'utf8')).toBe(original)
  await writeFile(path.join(sourceRoot, 'architecture/model.drawio'), drawing('新模型'))
  await expect(buildDiagrams({handbookRoot, check: true})).rejects.toThrow('sources or generation settings changed')
  expect(await readFile(svgPath, 'utf8')).toBe(original)
})

it('validates a standalone handbook and rejects altered generated files', async () => {
  await buildDiagrams({handbookRoot})
  await rename(sourceRoot, path.join(fixture, 'sources-outside-publication'))
  await expect(buildDiagrams({handbookRoot})).resolves.toMatchObject({standalone: true, count: 1})
  const svgPath = path.join(outputRoot, 'architecture/model.svg')
  await writeFile(svgPath, '<svg/>')
  await expect(buildDiagrams({handbookRoot, check: true})).rejects.toThrow('Generated diagram changed')
})

it('keeps the last successful publication when a later diagram cannot be rendered', async () => {
  await buildDiagrams({handbookRoot})
  const manifestPath = path.join(outputRoot, 'manifest.json')
  const published = await readFile(manifestPath, 'utf8')
  const svgPath = path.join(outputRoot, 'architecture/model.svg')
  const publishedSvg = await readFile(svgPath, 'utf8')
  await writeFile(path.join(sourceRoot, 'architecture/model.drawio'), drawing('新模型'))
  await writeFile(path.join(sourceRoot, 'architecture/unsupported.drawio'), drawing('Unsupported').replace('rounded=1', 'shape=mxgraph.unsupported'))
  await expect(buildDiagrams({handbookRoot})).rejects.toThrow('placeholder')
  expect(await readFile(manifestPath, 'utf8')).toBe(published)
  expect(await readFile(svgPath, 'utf8')).toBe(publishedSvg)
})

it('removes obsolete generated assets when a source is deleted', async () => {
  await writeFile(path.join(sourceRoot, 'architecture/obsolete.drawio'), drawing('旧图'))
  await buildDiagrams({handbookRoot})
  await rm(path.join(sourceRoot, 'architecture/obsolete.drawio'))
  await rm(path.join(outputRoot, 'architecture/obsolete.svg'))
  await buildDiagrams({handbookRoot})
  await expect(readFile(path.join(outputRoot, 'architecture/obsolete.svg'))).rejects.toMatchObject({code: 'ENOENT'})
  await expect(buildDiagrams({handbookRoot, check: true})).resolves.toMatchObject({count: 1})
})

it('exports HTML source artwork and preserves output when the source format changes', async () => {
  await buildDiagrams({handbookRoot})
  const svg = await readFile(path.join(outputRoot, 'architecture/model.svg'), 'utf8')
  await rm(path.join(sourceRoot, 'architecture/model.drawio'))
  await writeFile(path.join(sourceRoot, 'architecture/model.html'), `<html><body>${svg}</body></html>`)
  await buildDiagrams({handbookRoot})
  await expect(buildDiagrams({handbookRoot, check: true})).resolves.toMatchObject({count: 1})
  expect(await readFile(path.join(outputRoot, 'architecture/model.svg'), 'utf8')).toBe(svg)
})

it.each(['uri', 'base64'])('themes an embedded SVG while preserving its viewport (%s)', async encoding => {
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" fill="#ffffff" stroke="#e2e8f0"/><path d="M4 4L20 20" stroke="#285988"/><path d="M0 0L1 1" stroke="#00d2e9"/></svg>'
  const uri = encoding === 'base64'
    ? `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`
    : `data:image/svg+xml,${encodeURIComponent(icon)}`
  const source = `<svg xmlns="http://www.w3.org/2000/svg" class="ts-diagram" viewBox="0 0 100 100"><image href="${uri}" x="20" y="30" width="40" height="50" preserveAspectRatio="none"/></svg>`
  const css = await readFile(path.join(handbookRoot, 'src/css/diagrams.css'), 'utf8')
  const generated = renderDiagram(source, 'architecture/embedded.html', css)
  const root = parseXml(generated.svg).root
  const embedded = root.children.find(node => node.kind === 'element' && node.local === 'svg')
  const attributes = Object.fromEntries(embedded.attributes.map(attribute => [attribute.name, attribute.value]))
  expect(attributes).toMatchObject({viewBox: '0 0 24 24', x: '20', y: '30', width: '40', height: '50', preserveAspectRatio: 'none'})
  const [rect, themedPath, brandPath] = embedded.children.filter(node => node.kind === 'element')
  expect(rect.attributes.find(attribute => attribute.name === 'fill').value).toBe('var(--diagram-paper)')
  expect(themedPath.attributes.find(attribute => attribute.name === 'stroke').value).toBe('var(--diagram-blue-ink)')
  expect(brandPath.attributes.find(attribute => attribute.name === 'stroke').value).toBe('#00d2e9')
})

it('keeps bitmap image resources usable during SVG theme generation', async () => {
  const uri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'
  const source = `<svg xmlns="http://www.w3.org/2000/svg" class="ts-diagram" viewBox="0 0 10 10"><image href="${uri}" x="0" y="0" width="10" height="10"/></svg>`
  const css = await readFile(path.join(handbookRoot, 'src/css/diagrams.css'), 'utf8')
  const root = parseXml(renderDiagram(source, 'architecture/bitmap.html', css).svg).root
  const image = root.children.find(node => node.kind === 'element' && node.local === 'image')
  expect(image.attributes.find(attribute => attribute.name === 'href').value).toBe(uri)
})
