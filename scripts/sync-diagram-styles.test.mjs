// @vitest-environment node
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {afterEach, expect, it} from 'vitest'
import {syncDiagramStyles} from './sync-diagram-styles.mjs'

let fixture

afterEach(async () => {
  if (fixture) await rm(fixture, {recursive: true, force: true})
})

async function createHandbook() {
  fixture = await mkdtemp(path.join(tmpdir(), 'handbook-diagrams-'))
  await mkdir(path.join(fixture, 'src/css'), {recursive: true})
  await mkdir(path.join(fixture, 'docs/topic/.assets'), {recursive: true})
  await writeFile(path.join(fixture, 'src/css/diagrams.css'), '.ts-diagram { --diagram-paper: white; }\n')
  return path.join(fixture, 'docs/topic/.assets')
}

it('embeds the shared theme without changing diagram content or geometry', async () => {
  const assets = await createHandbook()
  const diagram = '<svg class="ts-diagram" viewBox="0 0 400 200"><title>模型</title><defs></defs><rect width="400" height="200"/><text x="20" y="40">业务模型</text></svg>'
  await writeFile(path.join(assets, 'model.svg'), diagram)
  await writeFile(path.join(assets, 'model.html'), `<html><body>${diagram}</body></html>`)

  expect(await syncDiagramStyles(fixture)).toHaveLength(2)
  const source = await readFile(path.join(assets, 'model.svg'), 'utf8')
  const svg = source
    .replace(/<style id="handbook-diagram-theme">[\s\S]*?<\/style>/, '')
    .replace(/<defs id="handbook-diagram-fills">[\s\S]*?<\/defs>/, '')
  expect(svg).toBe(diagram)
  expect(source).toContain('--diagram-paper: white')
  expect(source).toContain('id="handbook-wash-blue"')
  expect(source).toContain('stop-color="var(--diagram-blue-surface)"')
  expect(await syncDiagramStyles(fixture)).toEqual([])
})

it('detects drift without writing when checking', async () => {
  const assets = await createHandbook()
  const file = path.join(assets, 'model.svg')
  const diagram = '<svg class="ts-diagram"><defs><style id="handbook-diagram-theme">old</style></defs></svg>'
  await writeFile(file, diagram)

  expect(await syncDiagramStyles(fixture, {check: true})).toEqual(['docs/topic/.assets/model.svg'])
  expect(await readFile(file, 'utf8')).toBe(diagram)
  await syncDiagramStyles(fixture)
  expect(await syncDiagramStyles(fixture, {check: true})).toEqual([])
})

it('ignores unrelated assets and requires diagrams to opt into the shared style', async () => {
  const assets = await createHandbook()
  await writeFile(path.join(assets, 'logo.svg'), '<svg><rect fill="red"/></svg>')
  await writeFile(path.join(assets, 'source.drawio'), '<mxfile/>')
  await writeFile(path.join(assets, 'readme.md'), 'Documentation')

  expect(await syncDiagramStyles(fixture)).toEqual([])
  expect(await readFile(path.join(assets, 'logo.svg'), 'utf8')).toBe('<svg><rect fill="red"/></svg>')
})

it('adds definitions to an opted-in SVG that has none', async () => {
  const assets = await createHandbook()
  const file = path.join(assets, 'minimal.svg')
  await writeFile(file, '<svg class="ts-diagram"><text x="12" y="24">模型</text></svg>')

  expect(await syncDiagramStyles(fixture)).toEqual(['docs/topic/.assets/minimal.svg'])
  const source = await readFile(file, 'utf8')
  expect(source).toContain('<defs><style id="handbook-diagram-theme">')
  expect(source).toContain('<text x="12" y="24">模型</text>')
  expect(await syncDiagramStyles(fixture)).toEqual([])
})

it('repairs gradient definitions that no longer use the theme', async () => {
  const assets = await createHandbook()
  const file = path.join(assets, 'gradient.svg')
  await writeFile(file, '<svg class="ts-diagram"><defs><defs id="handbook-diagram-fills"><linearGradient id="handbook-wash-blue"><stop stop-color="red"/></linearGradient></defs></defs></svg>')

  expect(await syncDiagramStyles(fixture, {check: true})).toHaveLength(1)
  await syncDiagramStyles(fixture)
  const source = await readFile(file, 'utf8')
  expect(source).not.toContain('stop-color="red"')
  expect(source).toContain('stop-color="var(--diagram-blue-surface)"')
  expect(await syncDiagramStyles(fixture, {check: true})).toEqual([])
})
