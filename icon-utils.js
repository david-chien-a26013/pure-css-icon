import fs from 'node:fs'
import path from 'node:path'

export function filenameToClassName (filename) {
  return filename
    .replace('.svg', '')
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

export function svgToDataUri (svg) {
  const cleaned = svg
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, "'")
    .replace(/#/g, '%23')
  return `url("data:image/svg+xml,${cleaned}")`
}

// 共用的核心：掃描 assetsDir，為每個 SVG 產生兩種變體的 component 物件。
// 同時被 Tailwind plugin（addComponents）與 build 腳本（序列化成 CSS）使用。
export function buildIconComponents (assetsDir) {
  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.svg'))
  const components = {}

  for (const file of files) {
    const svg = fs.readFileSync(path.join(assetsDir, file), 'utf-8')
    const url = svgToDataUri(svg)
    const name = filenameToClassName(file)

    // background-image 變體：保留 SVG 原色
    components[`.i-${name}`] = {
      'display': 'inline-block',
      'width': '1em',
      'height': '1em',
      'background-image': url,
      'background-repeat': 'no-repeat',
      'background-size': '100% 100%',
      'vertical-align': 'middle'
    }

    // mask 變體：用 CSS color 染色
    components[`.i-${name}-mask`] = {
      'display': 'inline-block',
      'width': '1em',
      'height': '1em',
      'background': 'currentColor',
      '-webkit-mask-image': url,
      'mask-image': url,
      '-webkit-mask-repeat': 'no-repeat',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-size': '100% 100%',
      'mask-size': '100% 100%',
      'vertical-align': 'middle'
    }
  }

  return components
}

// 把 component 物件序列化成純 CSS 字串。
export function componentsToCss (components) {
  return Object.entries(components)
    .map(([selector, decls]) => {
      const body = Object.entries(decls)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n')
      return `${selector} {\n${body}\n}`
    })
    .join('\n\n')
}
