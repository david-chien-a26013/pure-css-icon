import { describe, it, expect } from 'vitest'
import { filenameToClassName, svgToDataUri } from '../icon-utils.js'

describe('filenameToClassName', () => {
  it('去掉 .svg 副檔名', () => {
    expect(filenameToClassName('icon-add.svg')).toBe('icon-add')
  })
  it('底線轉連字號', () => {
    expect(filenameToClassName('icon-delete_disable.svg')).toBe('icon-delete-disable')
  })
  it('camelCase 轉 kebab-case', () => {
    expect(filenameToClassName('button-pileEdit.svg')).toBe('button-pile-edit')
  })
  it('混合底線與 camelCase', () => {
    expect(filenameToClassName('button-clear-white_v3.svg')).toBe('button-clear-white-v3')
  })
})

describe('svgToDataUri', () => {
  it('壓縮空白並包成 url(data:...)', () => {
    const out = svgToDataUri('<svg>\n  <path/>\n</svg>')
    expect(out).toBe(`url("data:image/svg+xml,<svg> <path/> </svg>")`)
  })
  it('把 # 編碼成 %23', () => {
    expect(svgToDataUri('<svg fill="#2877EE"></svg>')).toContain('%232877EE')
  })
  it('把雙引號換成單引號', () => {
    expect(svgToDataUri('<svg fill="red"></svg>')).toContain("fill='red'")
  })
})
