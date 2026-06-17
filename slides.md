---
theme: default
title: Pure CSS SVG Icon
info: |
  用 TailwindCSS Plugin 把 SVG icon 變成 CSS Icon
highlighter: shiki
lineNumbers: true
transition: slide-left
routerMode: hash
---

<IconGallery />

---
class: text-center
---

# Pure CSS SVG Icon

### 用一個 TailwindCSS Plugin，把 SVG 變成 CSS Icon

<div class="pt-8 flex gap-6 justify-center items-center text-7xl">
  <i class="i-icon-add" />
  <i class="i-button-settings" />
  <i class="i-icon-save-mask text-emerald-500" />
  <i class="i-button-trashcan-mask text-rose-500" />
</div>

<div class="mt-10 mx-auto max-w-xl text-sm opacity-70 bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 text-black">
  ⚠️ 核心做法<b>並非我原創</b>，整理自 <b>Anthony Fu</b> 的
  <a href="https://antfu.me/posts/icons-in-pure-css-zh" class="text-blue-500">《Icons in Pure CSS (聊聊纯 CSS 图标)》</a>，
  我只是把它走過一遍、做成 Tailwind plugin 與 demo。
</div>

<div class="pt-8 text-sm opacity-60">
  David Chien ·　2026
</div>

<!--
講者開場：先強調這個技術不是我發明的，是 Anthony Fu 的文章；
我做的是把它整理成一套可用的 Tailwind plugin 流程。再讓大家看 demo。
-->

---

# 我們對 web icon 的期待

放一個 icon 而已，但其實我們想要很多：

<v-clicks>

- 🔍 **可調大小** —— 同一顆 icon，這裡 16px、那裡 48px
- 🎨 **可調顏色** —— hover 變色、disable 變灰、跟著主題走
- 🧹 **好維護** —— 新增一顆 icon 不要改一堆地方
- ⚡ **效能好** —— 不要為了幾顆 icon 多打一堆 request

</v-clicks>

<div v-click class="mt-8 text-xl">
接下來看看每種做法，<span class="text-rose-500 font-bold">卡在哪一關</span>。
</div>

---
layout: two-cols
---

# ① `<img>` tag

最直覺的做法：

```html
<img src="icon-add.svg" width="24" />
```

優點：

- 超簡單、瀏覽器原生支援
- 一個檔案一顆 icon，好管理

::right::

<div class="pl-6 pt-16">

### 😩 痛點

**不能動態改色。**

icon 的顏色寫死在 SVG 裡，要 hover 變色、要跟主題色，
只能準備好幾份不同顏色的檔案。

<div class="mt-6 text-sm opacity-70">
add.svg / add-blue.svg / add-gray.svg …
檔案愈長愈多。
</div>

</div>

---
layout: two-cols
---

# ② Inline SVG

把整段 SVG 直接塞進 HTML：

```html
<svg viewBox="0 0 24 24">
  <path d="M12 1.5C9.2…22.5 12 …" 
        fill="currentColor" />
</svg>
```

優點：

- 可以用 `fill` / `currentColor` 改色
- 完全可控

::right::

<div class="pl-6 pt-16">

### 😩 痛點

**程式碼膨脹、難維護。**

每用一次就是一坨 `<path>`，
template 被 icon 路徑淹沒；
同一顆 icon 用十次，就重複十段。

</div>

---
layout: two-cols
---

# ③ SVG → Vue Component

用 build plugin 把 `.svg` 包成元件：

```js
// vite-plugin-vue2-svg
import IconAdd from './add.svg?component'
```

```html
<IconAdd class="text-red-500" />
```

優點：

- import 進來像一般元件用
- 可改色、可控、template 乾淨

::right::

<div class="pl-6 pt-16">

### 😩 痛點

- **綁特定 build 工具 / 框架版本**
  （`vite-plugin-vue2-svg` 限 Vue 2 + Vite 2）
- 每顆 icon 都是一個 component instance
- 換框架 / 升級就要重找方案

</div>

---
layout: two-cols
---

# ④ Icon Font（IcoMoon）

把 icon 打包成字型，當文字用：

```html
<i class="icon icon-add"></i>
```

```css
.icon-add::before { content: "\e901"; }
```

優點：

- 用 `font-size` 調大小、`color` 調色，超順手
- 一個字型檔搞定全部 icon

::right::

<div class="pl-6 pt-16">

### 😩 痛點

- 受 **font 相關 CSS** 影響（line-height、字距、抗鋸齒…）
- 每次新增 icon 都要**重新產生字型檔**
- 偶爾出現「字型還沒載入，icon 變方塊」

</div>

---
layout: two-cols
---

# ⑤ SVG Sprite

把所有 SVG 合成一份，用 `<use>` 引用：

```html
<svg><use href="#icon-add" /></svg>
```

優點：

- 語法精簡，不用額外套件
- 共用一份檔案

::right::

<div class="pl-6 pt-16">

### 😩 痛點

- sprite 檔**隨 icon 數量一直長大**
- 每次增減 icon 都要**重新產生 sprite**
- 多色 / 染色的處理也不直覺

</div>

<div class="pl-6 mt-8 text-xl">
😮‍💨 兜了一圈，有沒有<span class="text-emerald-500 font-bold">兩全其美</span>的？
</div>

---
layout: center
class: text-center
---

# 轉折點

## 如果 …… 用 **CSS** 來放 icon 呢？

<div class="mt-6 text-lg opacity-70">
把 SVG 變成一張背景圖／一張遮罩，<br/>
用我們最熟的 <code>font-size</code> 和 <code>color</code> 來控制。
</div>

---
layout: two-cols
---

# ⑥ CSS `background-image`

把 SVG 變成 data URI 當背景圖：

```css
.i-icon-add {
  display: inline-block;
  width: 1em;        /* 跟著 font-size 縮放 */
  height: 1em;
  background-image: url("data:image/svg+xml,…");
  background-size: 100% 100%;
}
```

```html
<i class="i-icon-add" style="font-size:48px" />
```

::right::

<div class="pl-6 pt-16">

### ✅ 拿到了

- 用 `font-size` 控大小（`width:1em`）
- **保留 SVG 原色**（多色 icon 也 OK）
- 一個 class 搞定，無額外 request

### 😶 但是

還是**不能改色** —— 背景圖的顏色是寫死的。

</div>

---
layout: center
class: text-center
---

# Mask-Image 效果展示

<div class="grid grid-cols-2 gap-6 mt-4">

  <!-- gradient 示範 -->
  <div class="flex items-center justify-center gap-5">
    <div class="flex flex-col items-center gap-1">
      <i class="i-button-pile-edit" style="font-size:72px" />
      <span class="text-xs opacity-40">SVG mask</span>
    </div>
    <span class="text-3xl opacity-25">+</span>
    <div class="flex flex-col items-center gap-1">
      <div class="rounded" style="width:72px;height:72px;background:linear-gradient(135deg,#4285f4,#ea4335,#fbbc05,#34a853)" />
      <span class="text-xs opacity-40">gradient</span>
    </div>
    <span class="text-3xl opacity-25">=</span>
    <div class="flex flex-col items-center gap-1">
      <i class="i-button-pile-edit-mask" style="font-size:72px;background:linear-gradient(135deg,#4285f4,#ea4335,#fbbc05,#34a853)" />
      <span class="text-xs opacity-40">結果</span>
    </div>
  </div>

  <!-- photo 示範 -->
  <div class="flex items-center justify-center gap-5">
    <div class="flex flex-col items-center gap-1">
      <i class="i-button-pile-edit" style="font-size:72px" />
      <span class="text-xs opacity-40">SVG mask</span>
    </div>
    <span class="text-3xl opacity-25">+</span>
    <div class="flex flex-col items-center gap-1">
      <div class="rounded" style="width:72px;height:72px;background:url('./demo-photo.jpg') center/cover" />
      <span class="text-xs opacity-40">photo</span>
    </div>
    <span class="text-3xl opacity-25">=</span>
    <div class="flex flex-col items-center gap-1">
      <i class="i-button-pile-edit-mask" style="font-size:72px;background:url('./demo-photo.jpg') center/cover" />
      <span class="text-xs opacity-40">結果</span>
    </div>
  </div>

</div>

<!-- 原理說明 -->
<div class="mt-5 bg-gray-50 rounded-lg px-6 py-3 text-left text-sm grid grid-cols-2 gap-4 items-start">
  <div class="text-black">
    <div class="font-bold mb-1 opacity-70">🔍 原理</div>
    <code class="text-white">mask-image</code> 把 SVG 當「<b>鏤空模板</b>」——<br/>
    SVG 不透明的地方 → <code class="text-white">background</code> 透出來<br/>
    SVG 透明的地方 → 完全遮住<br/>
    <div class="mt-2 opacity-60">所以 <code class="text-white">background</code> 可以是任何東西：<br/>color、gradient、甚至 <code class="text-white">url(photo.jpg)</code></div>
  </div>
  <div>

```css
.icon {
  background: url(photo.jpg); /* 想顯示什麼 */
  mask-image: url(icon.svg);  /* 鏤空形狀 */
  mask-size: 100% 100%;
}
```

  </div>
</div>

---
layout: two-cols
---

# ⑦ CSS `mask-image` + `currentColor`

<div class="text-sm opacity-60 -mt-2 mb-2">靈感來自 Anthony Fu 的 Pure CSS Icons</div>

把 SVG 當**遮罩**，用底色當顏色：

```css
.i-icon-add-mask {
  display: inline-block;
  width: 1em; height: 1em;
  background: currentColor;   /* ← 顏色來源 */
  mask-image: url("data:image/svg+xml,…");
  mask-size: 100% 100%;
}
```

```html
<i class="i-icon-add-mask" 
   style="font-size:48px; color:red" />
```

::right::

<div class="pl-6 pt-12">

### 🎉 全部達成

- `font-size` 控大小
- **`color` 染色**（像 font icon 一樣）
- 沒有 font 的副作用
- 無額外 request

<div class="mt-4 flex items-center gap-4 text-6xl">
  <i class="i-icon-edit-mask text-sky-500" />
  <i class="i-icon-edit-mask text-rose-500" />
  <i class="i-icon-edit-mask text-emerald-500" />
</div>

<div class="mt-5 text-xs opacity-60">底色不限 currentColor，gradient 也行 ↓</div>
<div class="mt-1 flex items-center gap-3">
  <i class="i-icon-add-mask text-8xl" style="background: linear-gradient(135deg, #4285f4 0%, #ea4335 35%, #fbbc05 65%, #34a853 100%)" />
  <i class="i-button-settings-mask text-8xl" style="background: linear-gradient(135deg, #4285f4 0%, #ea4335 35%, #fbbc05 65%, #34a853 100%)" />
  <i class="i-icon-save-mask text-8xl" style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)" />
</div>

</div>

---
layout: center
---

# 兩種變體，各司其職

<div class="grid grid-cols-2 gap-8 mt-6 text-left">
<div class="p-6 border rounded-lg">

### `.i-{name}`
**background-image**

<div class="text-7xl my-4"><i class="i-button-pile-edit" /></div>

- 保留**原色 / 多色**
- 適合 logo、彩色插圖

</div>
<div class="p-6 border rounded-lg">

### `.i-{name}-mask`
**mask + currentColor**

<div class="text-7xl my-4 text-violet-600"><i class="i-button-pile-edit-mask" /></div>

- **單色可染**，跟著 `color`
- 適合 UI 操作 icon

</div>
</div>

---
layout: center
class: text-center
---

# 但 …… 總不能每顆都手刻 CSS 吧？

## 讓 **TailwindCSS Plugin** 自動產生 🤖

<div class="mt-6 text-lg opacity-70">
掃描 <code>assets/icons/</code> 資料夾，<br/>
每個 SVG 自動生成 <code>.i-{name}</code> 和 <code>.i-{name}-mask</code>。
</div>

---

# Plugin 核心：掃資料夾 → 產 class

```js {all|5|8-13|15-18|19-22|24}
// tailwind-plugin-bac-icons.js
import plugin from 'tailwindcss/plugin'
import { filenameToClassName, svgToDataUri } from './icon-utils.js'

const assetsDir = path.resolve(__dirname, 'assets/icons')

export default plugin(function ({ addComponents }) {
  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.svg'))
  const components = {}

  for (const file of files) {
    const url = svgToDataUri(fs.readFileSync(/* … */))   // SVG → data URI
    const name = filenameToClassName(file)               // 檔名 → class 名

    components[`.i-${name}`] = {                          // 原色變體
      width: '1em', height: '1em',
      backgroundImage: url, backgroundSize: '100% 100%',
    }
    components[`.i-${name}-mask`] = {                     // 染色變體
      width: '1em', height: '1em',
      background: 'currentColor', maskImage: url,
    }
  }
  addComponents(components)                               // 一次註冊全部
})
```

---

# 兩個工具函式

```js
// 檔名 → CSS class 名
function filenameToClassName (filename) {
  return filename
    .replace('.svg', '')        // 去副檔名
    .replace(/_/g, '-')         // 底線 → 連字號
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase → kebab-case
    .toLowerCase()
}

// SVG 字串 → data URI（讓 CSS background/mask 直接 inline 使用）
function svgToDataUri (svg) {
  const cleaned = svg
    .replace(/\s+/g, ' ').trim()   // 壓掉換行與多餘空白
    .replace(/"/g, "'")            // 雙引號 → 單引號（不破壞外層 url("…")）
    .replace(/#/g, '%23')          // # 要編碼，否則被當成 URL fragment
  return `url("data:image/svg+xml,${cleaned}")`
}
```

新增一顆 icon 的成本：**把 `.svg` 丟進資料夾就好。**
沒有重產字型、沒有重組 sprite、沒有額外 request。

---

# 在 TailwindCSS v4 裡掛上 plugin

v4 改用 **CSS-first** 設定，直接在 CSS 載入 plugin：

```css
/* style.css */
@import "tailwindcss";
@plugin "./tailwind-plugin-bac-icons.js";
```

搭配 `@tailwindcss/vite`：

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

<div class="mt-4 text-sm opacity-70">
💡 icon 用動態 class（<code>i-${name}</code>）時，記得用 <code>@source</code> 或 safelist
讓 Tailwind 別把它們 tree-shake 掉。
</div>

---

# 限制與取捨

<div class="grid grid-cols-3 gap-6 mt-2 text-left text-sm">

<div>

### 📐 只適合正方形 icon

`width / height` 都設 `1em` 把 icon 框成**正方形**。
SVG 會保持比例置中（不變形），但非正方形的 icon 會**留白、難對齊**：

<div class="mt-3 flex gap-3 justify-center">
  <div class="flex flex-col items-center gap-1">
    <div style="width:56px;height:56px;border:1px dashed #f43f5e;background:url('./demo-tall.svg') 100% 100%;background-repeat:no-repeat;background-position:center;" />
    <span class="text-xs opacity-50">直的</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div style="width:56px;height:56px;border:1px dashed #f43f5e;background:url('./demo-wide.svg') 100% 100%;background-repeat:no-repeat;background-position:center;" />
    <span class="text-xs opacity-50">橫的</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div style="width:56px;height:56px;border:1px dashed #cbd5e1;background:url('./demo-square.svg') 100% 100%;background-repeat:no-repeat;background-position:center;" />
    <span class="text-xs opacity-50">正方</span>
  </div>
</div>

<div class="mt-2 text-xs opacity-60">
虛線框＝1em 方框。扁/長 icon 要嘛改 viewBox 補成正方形，要嘛單獨給尺寸。
</div>

</div>

<div>

### ⚠️ Firefox 旋轉 mask 的 bug

旋轉中的 `mask` 元素曾經會破圖：

<div class="my-2 rounded border" style="height:110px;background:url('./firefox-mask-bug.png') center/contain no-repeat;background-color:#fff" />

<div class="text-xs opacity-60">
issue
<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1671784" class="text-blue-500">#1671784</a>
— 回報於 5 年前，已於 2 年前修復 ✅
</div>

</div>

<div>

### 📦 data URI 讓 CSS 變大？

37 顆 × 2 變體實測：

| | 大小 |
| --- | --- |
| 原始 SVG | 33 KB |
| CSS（raw） | 121 KB |
| **CSS（gzip）** | **≈ 10 KB** |

<div class="mt-2 text-xs opacity-70">
raw 膨脹，但重複性高、<b>gzip 後 ~10 KB</b>，又省 37 個 request。<br/>
→ 幾十顆<b>不嚴重</b>；上千顆才考慮拆外部檔。
</div>

</div>

</div>

---
layout: center
---

# 🧭 怎麼選變體

<div class="max-w-xl mx-auto mt-6">

| 情境 | 用哪個 |
| --- | --- |
| 多色 / logo / 彩色插圖 | `.i-{name}`（background-image） |
| 單色、需要染色 | `.i-{name}-mask`（mask） |
| hover / 狀態變色 | `-mask` + `:hover` 改 `color` |

</div>

---


<IconGallery />


---
layout: center
class: text-center
---

# 一句話心法

## 「把 SVG 丟進資料夾，就多了一個 icon class」

<div class="mt-8 text-lg opacity-80 text-left max-w-xl mx-auto">

- `<img>` → 不能改色　·　inline SVG → 太肥
- icon font / sprite → 要重新產生
- **CSS background + mask + Tailwind plugin** → 全部解決

</div>

<div class="mt-10 text-2xl">
Thank you! 　Q & A
</div>

<div class="pt-6 flex gap-4 justify-center text-5xl opacity-80">
  <i class="i-button-success-mask text-emerald-500" />
  <i class="i-icon-locale-normal" />
</div>

---
layout: center
---

# 參考資料

<div class="mt-4 p-4 border-2 border-blue-300 rounded-lg text-left max-w-3xl mx-auto bg-blue-50 text-black">
  <div class="text-xs opacity-50 mb-1">⭐ 核心來源 · Anthony Fu</div>
  <div class="font-semibold">Icons in Pure CSS (聊聊纯 CSS 图标)</div>
  <a href="https://antfu.me/posts/icons-in-pure-css-zh" class="text-blue-500 text-sm break-all">
    antfu.me/posts/icons-in-pure-css-zh
  </a>
  <div class="text-xs opacity-60 mt-1">本技術的原始出處，詳述 CSS mask-image icon 原理</div>
</div>

<div class="mt-4 grid grid-cols-2 gap-3 text-left text-sm max-w-3xl mx-auto">

  <div class="p-3 border rounded-lg">
    <div class="font-semibold">Icon Fonts 完整教學</div>
    <a href="https://www.cythilya.tw/2013/10/08/icon-fonts-tutorial/" class="text-blue-500 text-xs break-all">cythilya.tw/2013/10/08/icon-fonts-tutorial/</a>
    <div class="text-xs opacity-60 mt-1">Icon Font 做法的背景知識</div>
  </div>

  <div class="p-3 border rounded-lg">
    <div class="font-semibold">SVG Sprites 完整教學</div>
    <a href="https://www.cythilya.tw/2018/08/20/svg-sprites/" class="text-blue-500 text-xs break-all">cythilya.tw/2018/08/20/svg-sprites/</a>
    <div class="text-xs opacity-60 mt-1">SVG Sprite 做法的背景知識</div>
  </div>

  <div class="p-3 border rounded-lg">
    <div class="font-semibold">SVG icon 技術整理（知乎）</div>
    <a href="https://zhuanlan.zhihu.com/p/20683131" class="text-blue-500 text-xs break-all">zhuanlan.zhihu.com/p/20683131</a>
    <div class="text-xs opacity-60 mt-1">各種 SVG icon 方案比較</div>
  </div>

</div>
