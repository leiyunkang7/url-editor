<template>
  <div class="space-y-6">
    <!-- URL 编辑器 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-2 mb-4">
        <h2 class="text-lg font-semibold">URL 编辑器</h2>
        <div class="flex-1"></div>
        <button 
          @click="copyURL"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          复制
        </button>
      </div>
      
      <!-- 富文本URL编辑器 -->
      <RichURLEditor v-model="url" />
      
      <div class="text-sm text-gray-500 mt-4">
        完整URL: {{ url }}
      </div>
    </div>
    
    <!-- 快捷键提示 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">快捷键</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div 
          v-for="shortcut in shortcuts" 
          :key="shortcut.key"
          class="flex items-center space-x-2"
        >
          <kbd class="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
            {{ shortcut.key }}
          </kbd>
          <span class="text-sm text-gray-600">{{ shortcut.description }}</span>
        </div>
      </div>
    </div>
    
    <!-- 模板选择 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">模板</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="template in templates"
          :key="template.name"
          @click="applyTemplate(template.name)"
          class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {{ template.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { URLParser, TemplateEngine, HistoryManager } from '@url-editor/core'
import RichURLEditor from './RichURLEditor.vue'

const url = ref('https://www.example.com:80/api/users')
const templateEngine = new TemplateEngine()
const historyManager = new HistoryManager()

const templates = computed(() => templateEngine.getTemplates())

// 新的快捷键列表
const shortcuts = computed(() => [
  { key: 'Ctrl+/ 或 F1', description: '显示快捷键帮助' },
  { key: 'Ctrl+Space', description: '触发自动补全' },
  { key: 'Ctrl+Click', description: '选中整个URL部分' },
  { key: 'Ctrl+Shift+H', description: '切换协议(http↔https)' },
  { key: 'Esc', description: '关闭提示框/补全菜单' },
  { key: 'Ctrl+C', description: '复制完整URL' },
  { key: 'Ctrl+V', description: '粘贴并自动解析URL' },
])

const copyURL = () => {
  navigator.clipboard.writeText(url.value)
}

const applyTemplate = (templateName: string) => {
  try {
    const urlState = URLParser.parse(url.value)
    const newState = templateEngine.applyTemplate(templateName, urlState)
    url.value = URLParser.build(newState)
    historyManager.addToHistory(url.value)
  } catch (error) {
    console.error('Failed to apply template:', error)
  }
}

onMounted(() => {
  historyManager.addToHistory(url.value)
})
</script> 