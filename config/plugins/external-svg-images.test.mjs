// @vitest-environment node
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {createRequire} from 'node:module'
import webpack from 'webpack'
import {getFileLoaderUtils} from '@docusaurus/utils'
import {afterEach, expect, it} from 'vitest'
import externalSvgImagesPlugin from './external-svg-images.js'

const require = createRequire(import.meta.url)
let fixture

afterEach(async () => {
  if (fixture) await rm(fixture, {recursive: true, force: true})
})

it.each([false, true])('keeps small Markdown SVGs external while preserving bitmap loading (server: %s)', async (isServer) => {
  fixture = await mkdtemp(path.join(tmpdir(), 'handbook-svg-assets-'))
  const svgPath = path.join(fixture, 'viewbox-only.svg')
  const pngPath = path.join(fixture, 'tiny.png')
  await writeFile(svgPath, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 840"><rect width="1440" height="840" fill="blue"/></svg>')
  await writeFile(pngPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK2kAAAAASUVORK5CYII=', 'base64'))
  const loader = getFileLoaderUtils(isServer).loaders.inlineMarkdownImageFileLoader
  const entry = path.join(fixture, 'entry.cjs')
  await writeFile(entry, `module.exports = {svg: require(${JSON.stringify(loader + svgPath)}).default, ruleSvg: require(${JSON.stringify(svgPath + '?url')}).default, png: require(${JSON.stringify(loader + pngPath)}).default}`)
  const output = path.join(fixture, 'output')
  const compiler = webpack({
    mode: 'development',
    target: 'node',
    entry,
    module: {rules: [getFileLoaderUtils(isServer).rules.svgs()]},
    output: {path: output, filename: 'bundle.cjs', library: {type: 'commonjs2'}, publicPath: '/'},
    plugins: externalSvgImagesPlugin().configureWebpack().plugins,
  })
  try {
    const stats = await new Promise((resolve, reject) => compiler.run((error, result) => error ? reject(error) : resolve(result)))
    expect(stats.hasErrors(), stats.toString({all: false, errors: true})).toBe(false)
    const images = require(path.join(output, 'bundle.cjs'))
    expect(images.svg).toMatch(/^\/assets\/images\/viewbox-only-.*\.svg$/)
    expect(images.ruleSvg).toBe(images.svg)
    expect(images.png).toMatch(/^data:image\/png;base64,/)
    if (!isServer) expect(await readFile(path.join(output, images.svg), 'utf8')).toContain('viewBox="0 0 1440 840"')
  } finally {
    await new Promise((resolve, reject) => compiler.close((error) => error ? reject(error) : resolve()))
  }
})
