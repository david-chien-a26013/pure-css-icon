import tailwindcss from '@tailwindcss/vite'

// Slidev 會讀取並合併此設定。不從 'vite' import defineConfig，
// 因為 vite 只是 slidev 的間接相依、在 config 載入情境下無法解析。
export default {
  plugins: [tailwindcss()]
}
