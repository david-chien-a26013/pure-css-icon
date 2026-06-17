import plugin from 'tailwindcss/plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildIconComponents } from './icon-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, 'assets/icons')

// 在你自己的 TailwindCSS 專案，這就是全部 ——
// 掃 assets/icons/，為每個 SVG 註冊 .i-{name} 與 .i-{name}-mask。
export default plugin(function ({ addComponents }) {
  addComponents(buildIconComponents(assetsDir))
})
