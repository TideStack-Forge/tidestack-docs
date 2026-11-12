// @vitest-environment node
import {mkdtemp, writeFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {createRequire} from 'node:module'
import webpack from 'webpack'
import {afterAll, beforeAll, expect, it} from 'vitest'
import prism from './themeConfig.prism.js'

const require = createRequire(import.meta.url)
let fixture
let Prism

beforeAll(async () => {
  fixture = await mkdtemp(path.join(tmpdir(), 'handbook-prism-'))
  const siteConfig = path.join(fixture, 'site-config.cjs')
  await writeFile(siteConfig, `module.exports = ${JSON.stringify({themeConfig: {prism}})}`)
  const entry = path.join(fixture, 'entry.js')
  await writeFile(entry, `
    import {Prism} from ${JSON.stringify(require.resolve('prism-react-renderer'))}
    import includeLanguages from ${JSON.stringify(require.resolve('@docusaurus/theme-classic/lib/theme/prism-include-languages.js'))}
    includeLanguages(Prism)
    export {Prism}
  `)
  const themeClassic = require('@docusaurus/theme-classic').default
  const theme = themeClassic({
    i18n: {currentLocale: 'en', localeConfigs: {en: {direction: 'ltr'}}},
    siteConfig: {themeConfig: {prism}},
  }, {customCss: []})
  const {plugins} = theme.configureWebpack({}, false, {currentBundler: {instance: webpack}})
  const output = path.join(fixture, 'output')
  const compiler = webpack({
    mode: 'development',
    target: 'node',
    entry,
    resolve: {alias: {'@generated/docusaurus.config': siteConfig}},
    output: {path: output, filename: 'bundle.cjs', library: {type: 'commonjs2'}},
    plugins,
  })
  try {
    const stats = await new Promise((resolve, reject) => compiler.run((error, result) => error ? reject(error) : resolve(result)))
    expect(stats.hasErrors(), stats.toString({all: false, errors: true})).toBe(false)
    Prism = require(path.join(output, 'bundle.cjs')).Prism
  } finally {
    await new Promise((resolve, reject) => compiler.close((error) => error ? reject(error) : resolve()))
  }
})

afterAll(async () => {
  if (fixture) await rm(fixture, {recursive: true, force: true})
})

it('distinguishes JSON keys, strings, numbers, booleans and null in model definitions', () => {
  const json = '{"name":"shortText","size":60,"required":true,"default":null,"template":"${size}"}'
  expect(Prism.languages.json).toBeDefined()
  const tokens = Prism.tokenize(json, Prism.languages.json)
  const types = tokens.filter(token => typeof token !== 'string').map(token => token.type)
  expect(types).toEqual(expect.arrayContaining(['property', 'string', 'number', 'boolean', 'null', 'punctuation']))
  expect(tokens.some(token => token.type === 'string' && token.content === '"${size}"')).toBe(true)
})

it.each([
  ['powershell', '$port = 8080', 'variable'],
  ['properties', 'platform.port=8080', 'key'],
  ['diff', '-before\n+after', 'inserted-sign'],
  ['bash', 'echo "ready"', 'string'],
  ['java', 'public class Customer {}', 'keyword'],
  ['groovy', 'def name = "Customer"', 'keyword'],
  ['js', 'const name = "Customer"', 'keyword'],
  ['javascript', 'const name = "Customer"', 'string'],
  ['jsx', 'const label = <span>Customer</span>', 'tag'],
  ['ts', 'const count: number = 3', 'builtin'],
  ['yaml', 'port: 8080', 'key'],
  ['xml', '<project><version>1.0</version></project>', 'tag'],
  ['html', '<template><div ref="testRef"></div></template>', 'tag'],
])('highlights %s examples through the Docusaurus language loader', (language, code, expectedType) => {
  expect(Prism.languages[language]).toBeDefined()
  const types = Prism.tokenize(code, Prism.languages[language])
    .filter(token => typeof token !== 'string').map(token => token.type)
  expect(types).toContain(expectedType)
})
