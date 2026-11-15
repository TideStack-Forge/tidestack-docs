import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv from 'ajv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assets = path.join(root, 'static/capabilities')
const repository = path.resolve(root, '../..')
const hasSources = fs.existsSync(path.join(repository, 'platform/ouroboros-mothership/pom.xml'))
const catalog = JSON.parse(fs.readFileSync(path.join(assets, 'catalog.json'), 'utf8'))
const schema = JSON.parse(fs.readFileSync(path.join(assets, 'catalog.schema.json'), 'utf8'))
const validate = new Ajv({allErrors: true}).compile(schema)
const errors = []
if (!validate(catalog)) errors.push(...validate.errors.map(error => `${error.instancePath}: ${error.message}`))
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

function checkUnique(values, label) {
  if (new Set(values).size !== values.length) errors.push(`duplicate ${label}`)
}
function safePath(value) {
  return !path.isAbsolute(value) && !value.split(/[\\/]/).includes('..') && !value.includes('://')
}
checkUnique(catalog.categories.map(item => item.id), 'category id')
checkUnique(catalog.capabilities.map(item => item.id), 'capability id')
const ids = new Set(catalog.capabilities.map(item => item.id))
const categories = new Set(catalog.categories.map(item => item.id))

for (const item of catalog.capabilities) {
  const check = (condition, message) => { if (!condition) errors.push(`${item.id}: ${message}`) }
  check(item.id.startsWith(item.side === 'frontend' ? 'fe.' : 'be.'), 'id and side disagree')
  check(categories.has(item.category), `unknown category ${item.category}`)
  for (const id of item.related) check(ids.has(id) && id !== item.id, `invalid related id ${id}`)
  for (const doc of item.docs) {
    check(safePath(doc.path) && /\.mdx?$/.test(doc.path), `invalid doc path ${doc.path}`)
    check(fs.existsSync(path.join(root, 'docs', doc.path)), `missing doc ${doc.path}`)
  }
  for (const source of item.sources) {
    check(safePath(source), `invalid source path ${source}`)
    check(!source.includes('/src/test/'), `test used as implementation evidence ${source}`)
    if (hasSources) check(fs.existsSync(path.join(repository, source)), `missing source ${source}`)
    check(item.modules.some(module => source.startsWith(`${module}/`)), `source outside declared modules ${source}`)
  }
  for (const module of item.modules) {
    check(safePath(module), `invalid module path ${module}`)
    if (hasSources) check(fs.existsSync(path.join(repository, module)), `missing module ${module}`)
  }
}
for (const category of categories) {
  if (!catalog.capabilities.some(item => item.category === category)) errors.push(`empty category ${category}`)
}

const index = {
  schemaVersion: catalog.schemaVersion,
  source: catalog.source,
  catalog: 'catalog.json',
  categories: catalog.categories,
  selectionRules: catalog.selectionRules,
  capabilities: catalog.capabilities.map(({id, name, side, category, summary, useWhen, access}) =>
    ({id, name, side, category, summary, useWhen, access})),
}
const indexText = JSON.stringify(index, null, 2) + '\n'
const indexPath = path.join(assets, 'index.json')
if (!errors.length && process.argv.includes('--write-index')) fs.writeFileSync(indexPath, indexText)
if (!fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf8') !== indexText) {
  errors.push('index.json is out of sync; run npm run sync:capabilities')
}
if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'))
  process.exit(1)
}
const count = side => catalog.capabilities.filter(item => item.side === side).length
console.log(`Capability catalog OK: ${catalog.capabilities.length} entries (${count('frontend')} frontend, ${count('backend')} backend), ${categories.size} categories; source paths ${hasSources ? 'checked' : 'not available in this standalone checkout'}`)
