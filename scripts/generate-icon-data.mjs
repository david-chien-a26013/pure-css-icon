import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { filenameToClassName } from '../icon-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const assetsDir = path.join(root, 'assets/icons')
const outFile = path.join(root, 'components/icon-names.ts')

const names = fs.readdirSync(assetsDir)
  .filter(f => f.endsWith('.svg'))
  .map(filenameToClassName)
  .sort()

// safelist：列出每個 class 的兩種變體，讓 Tailwind v4 的 @source 掃得到、
// 確保 component class 不會因為 gallery 用動態 class 名而被 tree-shake 掉。
const safelist = names.flatMap(n => [`i-${n}`, `i-${n}-mask`]).join(' ')

const content = `// 此檔由 scripts/generate-icon-data.mjs 自動產生，請勿手動編輯。
export const iconNames = ${JSON.stringify(names, null, 2)} as const

// Tailwind safelist（被 style.css 的 @source 掃描）：
// ${safelist}
`

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, content)
console.log(`✓ 產生 ${names.length} 個 icon → components/icon-names.ts`)
