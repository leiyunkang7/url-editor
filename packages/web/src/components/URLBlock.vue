<template>
  <div 
    class="url-block"
    :class="{ 'focused': isFocused }"
    @click="$emit('focus')"
  >
    <div class="flex items-center space-x-2">
      <span class="text-xs text-gray-500 uppercase">{{ block.type }}</span>
      
      <!-- 切换编辑模式按钮 -->
      <button 
        v-if="supportsRichText"
        @click="toggleEditMode"
        class="px-2 py-1 text-xs rounded transition-colors"
        :class="isRichTextMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        {{ isRichTextMode ? '富文本' : '普通' }}
      </button>
      
      <!-- 普通输入框 -->
      <input
        v-if="!isRichTextMode"
        :value="block.value"
        @input="handleInput"
        @focus="$emit('focus')"
        class="flex-1 bg-transparent border-none outline-none text-sm"
        :placeholder="getPlaceholder()"
      />
      
      <!-- 富文本编辑器 -->
      <div 
        v-else
        class="flex-1 rich-text-editor"
        :class="{ 'focused': isFocused }"
        @click="$emit('focus')"
      >
        <editor-content 
          :editor="editor" 
          class="prose prose-sm max-w-none"
        />
      </div>
      
      <div class="shortcut-hint">{{ getShortcutHint() }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { URLBlock as URLBlockType } from '@url-editor/core'
import { ref, onUnmounted, watch } from 'vue'

interface Props {
  block: URLBlockType
  isFocused: boolean
}

interface Emits {
  (e: 'update', type: string, value: string): void
  (e: 'focus'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态管理
const isRichTextMode = ref(false)
const supportsRichText = ref(['path', 'query', 'fragment'].includes(props.block.type))

// 辅助函数 - 需要在 useEditor 之前定义
const getPlaceholder = (): string => {
  switch (props.block.type) {
    case 'protocol':
      return 'http'
    case 'domain':
      return 'example.com'
    case 'port':
      return '80'
    case 'path':
      return '/api/users'
    case 'query':
      return 'param=value'
    case 'fragment':
      return 'section'
    default:
      return ''
  }
}

const getShortcutHint = (): string => {
  switch (props.block.type) {
    case 'protocol':
      return 'Space'
    case 'domain':
      return 'Ctrl+←/→'
    case 'port':
      return '↑/↓'
    case 'path':
      return 'Ctrl+D'
    case 'query':
      return 'Enter'
    case 'fragment':
      return 'Tab'
    default:
      return ''
  }
}

// 创建富文本编辑器
const editor = useEditor({
  content: props.block.value,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: getPlaceholder(),
    }),
  ],
  onUpdate: ({ editor }) => {
    // 将HTML内容转换为纯文本
    const text = editor.getText()
    emit('update', props.block.type, text)
  },
  autofocus: false,
  editable: true,
})

// 监听block值变化
watch(() => props.block.value, (newVal) => {
  if (editor.value && newVal !== editor.value.getText()) {
    editor.value.commands.setContent(newVal)
  }
})

// 监听焦点状态变化
watch(() => props.isFocused, (newVal) => {
  if (newVal && editor.value && isRichTextMode.value) {
    editor.value.commands.focus()
  }
})

const toggleEditMode = () => {
  isRichTextMode.value = !isRichTextMode.value
  if (isRichTextMode.value && editor.value) {
    editor.value.commands.focus()
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', props.block.type, target.value)
}

// 组件卸载时销毁编辑器
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>
