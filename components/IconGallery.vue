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
  <div>
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
