import plugin from 'tailwindcss/plugin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { filenameToClassName, svgToDataUri } from './icon-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, 'assets/icons')

export default plugin(function ({ addComponents }) {
  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.svg'))
  const components = {}

  for (const file of files) {
    const svg = fs.readFileSync(path.join(assetsDir, file), 'utf-8')
    const url = svgToDataUri(svg)
    const name = filenameToClassName(file)

    // background-image 變體：保留 SVG 原色
    components[`.i-${name}`] = {
      display: 'inline-block',
      width: '1em',
      height: '1em',
      backgroundImage: url,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      verticalAlign: 'middle'
    }

    // mask 變體：用 CSS color 染色
    components[`.i-${name}-mask`] = {
      display: 'inline-block',
      width: '1em',
      height: '1em',
      background: 'currentColor',
      '-webkit-mask-image': url,
      'mask-image': url,
      '-webkit-mask-repeat': 'no-repeat',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-size': '100% 100%',
      'mask-size': '100% 100%',
      verticalAlign: 'middle'
    }
  }

  addComponents(components)
})
