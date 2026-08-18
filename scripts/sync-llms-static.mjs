import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const handbookRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticDir = path.join(handbookRoot, 'static')

fs.mkdirSync(staticDir, { recursive: true })

for (const fileName of ['llms.txt', 'llms-full.txt']) {
  fs.copyFileSync(path.join(handbookRoot, fileName), path.join(staticDir, fileName))
}

console.log('Synced llms.txt and llms-full.txt to static/')
