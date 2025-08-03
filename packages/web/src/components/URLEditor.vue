<template>
  <div class="space-y-6">
    <!-- URL 编辑器 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-2 mb-4">
        <h2 class="text-lg font-semibold">URL 编辑器</h2>
        <div class="flex-1"></div>
        <button 
          @click="copyURL"
          class="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
        >
          复制
        </button>
      </div>
      
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <URLBlock 
          v-for="(block, index) in urlState.blocks" 
          :key="block.type"
          :block="block"
          :is-focused="index === urlState.currentBlockIndex"
          @update="updateBlock"
          @focus="focusBlock(index)"
        />
      </div>
      
      <div class="text-sm text-gray-500">
        完整URL: {{ fullURL }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { URLParser, TemplateEngine, KeyboardManager, HistoryManager } from '@url-editor/core'
import URLBlock from './URLBlock.vue'

const urlState = ref(URLParser.parse('https://www.example.com:80/api/users'))
const templateEngine = new TemplateEngine()
const historyManager = new HistoryManager()
const keyboardManager = new KeyboardManager(urlState.value)

const templates = computed(() => templateEngine.getTemplates())
const shortcuts = computed(() => keyboardManager.getShortcuts())

const fullURL = computed(() => URLParser.build(urlState.value))

const updateBlock = (type: string, value: string) => {
  // 更新对应区块的值
  switch (type) {
    case 'protocol':
      urlState.value.protocol = value
      break
    case 'domain':
      urlState.value.domain = value
      break
    case 'port':
      urlState.value.port = value
      break
    case 'path':
      urlState.value.path = value
      break
    case 'query':
      urlState.value.query = value
      break
    case 'fragment':
      urlState.value.fragment = value
      break
  }
  
  // 重新解析URL以更新区块
  urlState.value = URLParser.parse(URLParser.build(urlState.value))
  historyManager.addToHistory(fullURL.value)
}

const focusBlock = (index: number) => {
  urlState.value.currentBlockIndex = index
  urlState.value.blocks.forEach((block, i) => {
    block.focused = i === index
  })
}

const copyURL = () => {
  navigator.clipboard.writeText(fullURL.value)
}

const applyTemplate = (templateName: string) => {
  try {
    urlState.value = templateEngine.applyTemplate(templateName, urlState.value)
    historyManager.addToHistory(fullURL.value)
  } catch (error) {
    console.error('Failed to apply template:', error)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  keyboardManager.handleKeyEvent(event)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script> 