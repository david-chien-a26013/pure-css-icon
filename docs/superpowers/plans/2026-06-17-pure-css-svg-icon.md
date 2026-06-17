# Pure CSS SVG Icon 簡報 & Live Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個 Slidev 簡報專案，講解如何用 TailwindCSS v4 plugin 把 SVG icon 轉成 CSS class icon，並內嵌一個可即時調整大小／顏色的 live demo gallery。

**Architecture:** 單一 Slidev 專案。一個 build-time 腳本掃描 `assets/icons/` 產生 icon 名稱資料與 Tailwind safelist；一個 Tailwind v4 plugin（`@plugin` 載入）把每個 SVG 變成 `.i-{name}`（background-image，原色）與 `.i-{name}-mask`（mask + currentColor，可染色）兩個 component class；`IconGallery.vue` 內嵌在投影片中展示。

**Tech Stack:** Slidev、Vue 3 `<script setup>` + TypeScript、TailwindCSS v4、`@tailwindcss/vite`、Vitest、pnpm。

---

## File Structure

| 檔案 | 責任 |
| --- | --- |
| `package.json` | 相依與 scripts（dev / build / test / 生成 icon 資料） |
| `vite.config.ts` | 掛 `@tailwindcss/vite` plugin |
| `style.css` | Slidev 自動載入的全域樣式；`@import "tailwindcss"`、`@plugin`、`@source` |
| `icon-utils.js` | 純函式：`filenameToClassName`、`svgToDataUri`（可測試） |
| `tailwind-plugin-bac-icons.js` | Tailwind v4 plugin：掃 SVG → addComponents |
| `scripts/generate-icon-data.mjs` | 掃 `assets/icons/` → 產生 `components/icon-names.ts` |
| `components/icon-names.ts` | （自動產生）icon 名稱陣列 + Tailwind safelist 字串 |
| `components/IconGallery.vue` | 內嵌 demo：gallery + size/color 控制 |
| `slides.md` | 簡報內容（演進史 → plugin → demo） |
| `assets/icons/*.svg` | 借自 vue-bac-lib 的 37 個 SVG |
| `test/icon-utils.test.js` | icon-utils 單元測試 |

**Note on `git commit` steps:** 此目錄初始非 git repo，Task 0 會 `git init`（純本地，不 push）。所有 commit 都是本地 commit。

---

### Task 0: 初始化專案與相依

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 git 與 pnpm 專案**

Run（在 `/Users/a26013/Documents/Project/poc/svg-font-icon`）:
```bash
git init
pnpm init
```

- [ ] **Step 2: 寫 `.gitignore`**

```
node_modules
dist
.slidev
*.local
```

- [ ] **Step 3: 安裝相依**

Run:
```bash
pnpm add -D @slidev/cli @slidev/theme-default tailwindcss @tailwindcss/vite vitest
```
Expected: 安裝成功，`package.json` 出現上述 devDependencies。

- [ ] **Step 4: 設定 `package.json` scripts**

把 `package.json` 的 `"scripts"`、`"type"` 改成：
```json
{
  "type": "module",
  "scripts": {
    "predev": "node scripts/generate-icon-data.mjs",
    "dev": "slidev",
    "prebuild": "node scripts/generate-icon-data.mjs",
    "build": "slidev build",
    "gen:icons": "node scripts/generate-icon-data.mjs",
    "test": "vitest run"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: 初始化 Slidev + Tailwind v4 專案"
```

---

### Task 1: 匯入 SVG 素材

**Files:**
- Create: `assets/icons/` (37 個 SVG)

- [ ] **Step 1: 複製 vue-bac-lib 的 SVG**

Run:
```bash
mkdir -p assets/icons
cp /Users/a26013/Documents/Project/crm-workspace/vue-bac-lib/src/styles/assets/*.svg assets/icons/
```

- [ ] **Step 2: 驗證數量**

Run:
```bash
ls assets/icons/*.svg | wc -l
```
Expected: `37`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 匯入 37 個 SVG icon 素材"
```

---

### Task 2: icon-utils 純函式（TDD）

**Files:**
- Create: `icon-utils.js`
- Test: `test/icon-utils.test.js`

- [ ] **Step 1: 寫失敗測試**

`test/icon-utils.test.js`:
```js
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
    expect(out).toBe(`url("data:image/svg+xml,<svg> <path/></svg>")`)
  })
  it('把 # 編碼成 %23', () => {
    expect(svgToDataUri('<svg fill="#2877EE"></svg>')).toContain('%232877EE')
  })
  it("把雙引號換成單引號", () => {
    expect(svgToDataUri('<svg fill="red"></svg>')).toContain("fill='red'")
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test`
Expected: FAIL（`icon-utils.js` 不存在 / 函式未定義）

- [ ] **Step 3: 寫最小實作**

`icon-utils.js`:
```js
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test`
Expected: PASS（7 個測試全綠）

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 加入 icon-utils 純函式（filenameToClassName / svgToDataUri）"
```

---

### Task 3: 生成 icon 資料腳本

**Files:**
- Create: `scripts/generate-icon-data.mjs`
- Create (產生物): `components/icon-names.ts`

- [ ] **Step 1: 寫腳本**

`scripts/generate-icon-data.mjs`:
```js
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
```

- [ ] **Step 2: 執行腳本**

Run: `pnpm gen:icons`
Expected: 輸出 `✓ 產生 37 個 icon → components/icon-names.ts`

- [ ] **Step 3: 驗證產生內容**

Run: `head -5 components/icon-names.ts && grep -c 'i-' components/icon-names.ts`
Expected: 檔案含 `export const iconNames`，且 safelist 註解那行包含 `i-icon-add i-icon-add-mask` 等 token。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 加入 icon 資料生成腳本與產生物"
```

---

### Task 4: Tailwind v4 plugin

**Files:**
- Create: `tailwind-plugin-bac-icons.js`

- [ ] **Step 1: 寫 plugin**

`tailwind-plugin-bac-icons.js`:
```js
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: 加入 tailwind-plugin-bac-icons（SVG → CSS class）"
```

---

### Task 5: 整合 Tailwind v4 進 Slidev 並驗證渲染

**Files:**
- Create: `vite.config.ts`
- Create: `style.css`
- Create: `slides.md`（暫時最小版，供驗證）
- Create: `verify-icon.html`（臨時驗證頁，驗證後刪除）

- [ ] **Step 1: 寫 `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()]
})
```

- [ ] **Step 2: 寫 `style.css`**

```css
@import "tailwindcss";
@plugin "./tailwind-plugin-bac-icons.js";

/* 掃描 icon-names.ts 內的 safelist 註解，確保 37×2 個 class 都產生 */
@source "./components/icon-names.ts";
```

- [ ] **Step 3: 寫最小 `slides.md` 驗證頁**

```md
---
theme: default
title: Pure CSS SVG Icon
---

# Pure CSS SVG Icon

<div class="flex gap-4 items-center text-6xl">
  <i class="i-icon-add" />
  <i class="i-icon-edit-mask text-red-500" />
</div>
```

- [ ] **Step 4: 啟動 dev server 並驗證**

Run: `pnpm dev`（背景啟動），開瀏覽器到 Slidev 顯示的 URL。
Expected:
- `i-icon-add` 顯示原色（藍色）加號圖
- `i-icon-edit-mask` 顯示**紅色**編輯圖（mask + currentColor 生效）
- 兩個 icon 大小都約 6xl（font-size 控制）

若 mask 變體沒上色或 icon 不顯示：檢查 `style.css` 的 `@plugin` 路徑、`@source` 是否掃到 safelist；確認 `pnpm gen:icons` 已跑過。

- [ ] **Step 5: 刪除臨時驗證內容並 commit**

確認渲染正確後停掉 dev server。保留 `slides.md`（下個 task 會擴充）。
```bash
git add -A
git commit -m "feat: 整合 Tailwind v4 進 Slidev，icon class 正確渲染"
```

---

### Task 6: IconGallery 內嵌 demo 元件

**Files:**
- Create: `components/IconGallery.vue`

- [ ] **Step 1: 寫元件**

`components/IconGallery.vue`:
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { iconNames } from './icon-names'

const size = ref(48)
const color = ref('#F4493E')
const keyword = ref('')
const copied = ref('')

const filtered = computed(() =>
  iconNames.filter(n => n.includes(keyword.value.trim().toLowerCase()))
)

async function copyClass (name: string) {
  await navigator.clipboard.writeText(`i-${name}`)
  copied.value = name
  setTimeout(() => { if (copied.value === name) copied.value = '' }, 1200)
}
</script>

<template>
  <div class="not-prose">
    <!-- 控制列 -->
    <div class="flex flex-wrap items-center gap-4 mb-4 text-sm">
      <label class="flex items-center gap-2">
        大小
        <input type="range" min="16" max="96" v-model.number="size" />
        <span class="w-10 text-right tabular-nums">{{ size }}px</span>
      </label>
      <label class="flex items-center gap-2">
        mask 顏色
        <input type="color" v-model="color" />
      </label>
      <input
        v-model="keyword"
        placeholder="搜尋 icon 名稱…"
        class="border rounded px-2 py-1"
      />
      <span class="text-gray-400">共 {{ filtered.length }} 個</span>
    </div>

    <!-- gallery -->
    <div class="grid grid-cols-4 gap-3 max-h-[60vh] overflow-auto pr-2">
      <div
        v-for="name in filtered"
        :key="name"
        class="flex flex-col items-center gap-2 p-3 border rounded cursor-pointer hover:border-blue-500"
        :class="{ 'border-blue-500 shadow': copied === name }"
        @click="copyClass(name)"
      >
        <div class="flex items-center gap-3">
          <!-- 原色（background-image） -->
          <i :class="`i-${name}`" :style="{ fontSize: size + 'px' }" :title="`i-${name}`" />
          <!-- 染色（mask + currentColor） -->
          <i
            :class="`i-${name}-mask`"
            :style="{ fontSize: size + 'px', color }"
            :title="`i-${name}-mask`"
          />
        </div>
        <span class="text-xs text-gray-500 text-center break-all leading-tight">{{ name }}</span>
        <span v-if="copied === name" class="text-xs text-blue-500">已複製!</span>
      </div>
    </div>
    <p class="text-gray-400 text-xs mt-3">
      左：原色（background-image）　右：mask（可染色）　點擊複製 class
    </p>
  </div>
</template>
```

- [ ] **Step 2: 在 slides.md 暫時掛上元件驗證**

把 `slides.md` 結尾暫時加一頁：
```md
---

# Demo

<IconGallery />
```

- [ ] **Step 3: dev server 驗證**

Run: `pnpm dev`（背景），開該頁。
Expected:
- 列出 37 個 icon，每格左原色／右染色並排
- 拉 size slider → 所有 icon 即時放大縮小
- 改 color → 右側 mask icon 即時變色（左側不變）
- 搜尋「edit」→ 只剩含 edit 的 icon
- 點格子 → 顯示「已複製!」，剪貼簿為 `i-{name}`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 加入 IconGallery 內嵌 demo 元件"
```

---

### Task 7: 撰寫簡報內容（演進史 → plugin）

**Files:**
- Modify: `slides.md`（完整改寫）

- [ ] **Step 1: 改寫 `slides.md` 為完整簡報**

依下列章節撰寫（每頁用 `---` 分隔，使用 default theme）。**全程不得出現 "FunNow"。**

1. **封面**：標題「Pure CSS SVG Icon — 用 TailwindCSS Plugin 把 SVG 變成 class」、講者、日期。
2. **開場：我們對 web icon 的需求**：可調大小、可調顏色、好維護、效能（少請求）。
3. **`<img>` tag**：code snippet `<img src="add.svg">`；痛點：**不能動態改色**。
4. **inline SVG**：snippet 一坨 `<svg><path/></svg>`；痛點：**可改色但程式碼膨脹、難維護**。
5. **Icon Font（IcoMoon）**：用 `font-size`/`color` 控制；痛點：**受 font 相關 CSS 影響、每次新增要重產字型**。
6. **SVG Sprite**：`<use href="#icon">`；痛點：**檔案隨 icon 增長、要重新產生 sprite**。
7. **轉折：CSS `background-image`（data URI）**：用 `font-size`（`width:1em`）控大小、**保留原色**；痛點：**不能改色**。
8. **高潮：CSS `mask-image` + `currentColor`**：受 Anthony Fu 啟發；像 font icon 一樣 `color` 染色，又**沒有 font 的副作用**。對照 background vs mask。
9. **怎麼自動化？→ TailwindCSS plugin**：掃 `assets/icons/` 自動產生 `.i-{name}` 與 `.i-{name}-mask`。
10. **plugin 程式碼解析**：貼 `tailwind-plugin-bac-icons.js` 重點（`addComponents`、data URI 編碼、兩種變體）。用 Slidev 的 code block line highlighting 分段講。
11. **v4 整合**：`style.css` 的 `@import "tailwindcss"` + `@plugin "./..."`；`@tailwindcss/vite`。
12. **Live Demo**：`<IconGallery />`。
13. **限制與取捨**：Firefox 旋轉 mask 的 bug、data URI 體積、何時用 background（要原色/多色）何時用 mask（要單色染色）。
14. **總結 / Q&A**：一句話心法 +「掃資料夾就有 class，新增 icon 零成本」。

Frontmatter 範例（封面頁）：
```md
---
theme: default
title: Pure CSS SVG Icon
highlighter: shiki
lineNumbers: true
---
```

Code highlighting 範例（第 10 頁）：使用 Slidev 的 ` ```js {2-5|7-20} ` 分步驟 highlight。

- [ ] **Step 2: 確認無 "FunNow"**

Run: `grep -ri "funnow" . --include="*.md" --include="*.vue" --include="*.js" --include="*.ts" | grep -v node_modules`
Expected: 無任何輸出。

- [ ] **Step 3: dev server 通讀**

Run: `pnpm dev`，逐頁翻過確認每頁排版正常、code snippet 正確、demo 頁可互動。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 完成簡報內容（icon 演進史 → TailwindCSS plugin）"
```

---

### Task 8: 最終驗收

**Files:** 無（驗證）

- [ ] **Step 1: 單元測試全綠**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 2: build 成功**

Run: `pnpm build`
Expected: 成功產出 `dist/`，無錯誤。

- [ ] **Step 3: 對照驗收條件（spec §7）逐項確認**

- [ ] `pnpm dev` 可啟動、deck 可翻頁
- [ ] IconGallery 兩種變體渲染正確；size/color 即時生效；搜尋、點擊複製可用
- [ ] `pnpm build` 成功
- [ ] 全簡報與 demo 無 "FunNow"
- [ ] 演進史各段都有 code snippet 與痛點

- [ ] **Step 4: 最終 commit**

```bash
git add -A
git commit -m "chore: 最終驗收通過"
```

---

## Self-Review

**Spec coverage：**
- 核心 plugin（spec §4.1）→ Task 4 ✓
- v4 整合（§4.2）→ Task 5 ✓
- IconGallery 並排雙變體 + 控制（§4.3）→ Task 6 ✓
- 簡報演進史敘事（§5）→ Task 7 ✓
- UnoCSS `i-` 衝突風險（§6）→ Task 5 Step 4 實測驗證 ✓
- v4 plugin 相容/purge 風險（§6）→ Task 3 safelist + Task 5 驗證 ✓
- 驗收條件（§7）→ Task 8 ✓
- 無 FunNow（§1, §7）→ Task 7 Step 2 + Task 8 ✓

**Placeholder scan：** 無 TBD/TODO；每個 code step 都有完整程式碼。

**Type consistency：** `filenameToClassName`/`svgToDataUri` 在 Task 2 定義，Task 3/4 import 使用，簽名一致；`iconNames` 在 Task 3 產生、Task 6 import，名稱一致。
