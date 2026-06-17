import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { filenameToClassName, buildIconComponents, componentsToCss } from '../icon-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const assetsDir = path.join(root, 'assets/icons')

// 1) icon 名稱清單 → 給 IconGallery 用
const names = fs.readdirSync(assetsDir)
  .filter(f => f.endsWith('.svg'))
  .map(filenameToClassName)
  .sort()

const namesFile = path.join(root, 'components/icon-names.ts')
fs.mkdirSync(path.dirname(namesFile), { recursive: true })
fs.writeFileSync(namesFile,
  `// 此檔由 scripts/generate-icon-data.mjs 自動產生，請勿手動編輯。
export const iconNames = ${JSON.stringify(names, null, 2)} as const
`)

// 2) 純 CSS（用與 Tailwind plugin 相同的核心 buildIconComponents 產生）
//    Slidev 本身跑在 UnoCSS 上，無法在同一個 build 內再跑 Tailwind 引擎，
//    所以這裡把 icon component 預先編譯成純 CSS 給 Slidev 直接載入。
const css = `/* 此檔由 scripts/generate-icon-data.mjs 自動產生，請勿手動編輯。 */
${componentsToCss(buildIconComponents(assetsDir))}
`
fs.writeFileSync(path.join(root, 'style-icons.css'), css)

console.log(`✓ 產生 ${names.length} 個 icon → components/icon-names.ts + style-icons.css`)
