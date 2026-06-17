# Pure CSS SVG Icon — 簡報 & Live Demo 設計文件

- 日期：2026-06-17
- 目的：在 15 分鐘分享會講解如何用 TailwindCSS plugin 把 SVG icon 轉成 CSS class icon
- 形式：單一 Slidev 專案，內嵌可互動的 live demo

## 1. 背景與目標

要傳達的核心技術：一個 TailwindCSS plugin，自動掃描 SVG 資料夾，為每個 icon 產生兩種
CSS class 變體——`.i-{name}`（`background-image`，保留原色）與 `.i-{name}-mask`
（`mask-image` + `currentColor`，可用 CSS `color` 染色）。

此技術源自使用者部落格文章（WindiCSS 時代，受 Anthony Fu 的 pure CSS icon 啟發），
已在 `vue-bac-lib`（`tailwind-plugin-bac-icons.js`）中成熟落地。本專案將其移植到
**TailwindCSS v4** 並做成可分享的簡報與現場 demo。

**硬性需求：所有產出（slides、demo、註解）不得出現 "FunNow" 字樣。**

## 2. 技術決策（已與使用者確認）

| 決策 | 選擇 | 理由 |
| --- | --- | --- |
| TailwindCSS 版本 | **v4** | 2026 最新；CSS-first 設定、`@plugin` 指令、`@tailwindcss/vite` |
| 簡報主軸 | **演進史 → 收斂到 plugin** | 呼應部落格脈絡，故事性強 |
| 簡報與 demo 關係 | **Slidev 內嵌 demo** | 單一專案，gallery 為內嵌 Vue 元件 |
| 套件管理器 | **pnpm** | 環境慣例 |
| Gallery 變體展示 | **原色 + 染色並排** | 最能說明 background vs mask 差異 |

## 3. 架構總覽

單一 Slidev 專案，位於 `/Users/a26013/Documents/Project/poc/pure-css-icon`。
Tailwind v4 透過 `@tailwindcss/vite` 整合進 Slidev 的 Vite pipeline。

```
pure-css-icon/
├── slides.md                    # Slidev 主檔（演進史 → plugin）
├── package.json                 # slidev + tailwindcss v4 + @tailwindcss/vite
├── vite.config.ts               # 掛 @tailwindcss/vite plugin
├── setup/main.ts                # Slidev setup：import ../style.css
├── style.css                    # @import "tailwindcss"; @plugin "./tailwind-plugin-bac-icons.js"
├── tailwind-plugin-bac-icons.js # 核心：掃 SVG → 產生 .i-{name} / .i-{name}-mask
├── assets/icons/*.svg           # 借自 vue-bac-lib 的 37 個 SVG
├── components/
│   └── IconGallery.vue          # 內嵌 demo：列出全部 icon + size/color 控制
└── docs/superpowers/specs/      # 本設計文件
```

## 4. 核心元件規格

### 4.1 `tailwind-plugin-bac-icons.js`

移植自 vue-bac-lib，行為：

- 讀 `assets/icons/` 下所有 `.svg`
- 將 SVG 內容壓縮空白、`"` → `'`、`#` → `%23`，inline 成 `url("data:image/svg+xml,...")`
- 檔名轉 class 名：去 `.svg`、`_`→`-`、camelCase→kebab、轉小寫
- 每個 icon 產生兩個 component class：
  - `.i-{name}`：`display:inline-block; width:1em; height:1em; background-image:url(...);
    background-repeat:no-repeat; background-size:100% 100%; vertical-align:middle`
    （保留原色，`font-size` 控大小）
  - `.i-{name}-mask`：同上但用 `background:currentColor` + `mask-image`/`-webkit-mask-image`
    系列屬性（可用 `color` 染色）
- 使用 `tailwindcss/plugin` 的 `addComponents` API（v4 仍相容，透過 CSS `@plugin` 載入）

### 4.2 v4 整合方式

- `style.css`：
  ```css
  @import "tailwindcss";
  @plugin "./tailwind-plugin-bac-icons.js";
  ```
- `vite.config.ts`：加入 `@tailwindcss/vite` plugin
- `setup/main.ts`：在 Slidev client setup 中 `import '../style.css'`

### 4.3 `IconGallery.vue`（內嵌 demo）

參考 vue-bac-lib 的 `ComponentsPlayground.vue` Icons tab。

- 列出全部 37 個 icon；每格**並排**顯示 `.i-{name}`（原色）與 `.i-{name}-mask`（染色）
- 控制項：
  - size slider → 改 `font-size`
  - color picker → 改 mask 變體的 `color`
  - 搜尋框 → 依名稱過濾
  - 點擊格子 → 複製 class name 到剪貼簿
- 以 `<script setup>` + TypeScript 撰寫

## 5. 簡報敘事（slides.md，約 15 分鐘）

1. 開場：web icon 的需求（可調大小／顏色、好維護、效能）
2. 演進史（每種附痛點 + code snippet）：
   - `<img>` tag — 簡單但不能改色
   - inline SVG — 可改色但程式碼膨脹、難維護
   - Icon Font（IcoMoon）— 好調大小顏色，但受 font CSS 影響、要重新產生
   - SVG Sprite — 語法精簡，但檔案隨 icon 增長、要重新產生
3. 轉折：CSS `background-image`（data URI、font-size 控大小、保留原色）
4. 高潮：CSS `mask-image` + `currentColor`（受 Anthony Fu 啟發；像 font icon 染色，無 font 副作用）
5. 自動化：做成 TailwindCSS plugin（掃資料夾自動產 class）
6. plugin 程式碼解析 + v4 整合方式
7. Live Demo（內嵌 IconGallery，現場調大小／顏色）
8. 限制與取捨：Firefox mask 旋轉 bug、data URI 體積、兩種變體何時用
9. 總結 / Q&A

## 6. 已知整合風險

- **UnoCSS `i-` 前綴衝突**：Slidev 內建 UnoCSS 也用 `i-` 前綴（如 `i-carbon-add`）。
  我們的 class 為真實 CSS rule，名稱（`i-icon-add` 等）不會對應到 UnoCSS 的 iconify
  collection，理論上不衝突；實作時須實測渲染確認。
- **v4 plugin 相容性**：v3 的 `addComponents` JS plugin 須透過 v4 的 `@plugin` 指令載入；
  須驗證 data URI component class 確實被產生。

## 7. 驗收條件

- `pnpm dev` 可啟動，deck 可翻頁
- IconGallery 兩種變體都正確渲染；調 size／color 即時生效；搜尋與點擊複製可用
- `pnpm build`（slidev build）成功產出靜態檔
- 全簡報與 demo 無 "FunNow" 字樣
- 演進史各段落都有對應 code snippet 與痛點說明

## 8. 範圍外（YAGNI）

- 不另做獨立的 standalone demo web（已決定內嵌 Slidev）
- 不支援 base64 編碼變體（部落格提及但本次不納入）
- 不處理 icon 的 build-time 最佳化（svgo 等）
