<template>
  <div 
    class="url-block"
    :class="{ 'focused': isFocused }"
    @click="$emit('focus')"
  >
    <div class="flex items-center space-x-2">
      <span class="text-xs text-gray-500 uppercase">{{ block.type }}</span>
      
      <!-- 富文本编辑器容器 -->
      <div 
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
import { ref, onMounted, onUnmounted, watch } from 'vue'

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

// 监听焦点状态变化
watch(() => props.isFocused, (newVal) => {
  if (newVal && editor.value) {
    editor.value.commands.focus()
  }
})

// 监听block值变化
watch(() => props.block.value, (newVal) => {
  if (editor.value && newVal !== editor.value.getText()) {
    editor.value.commands.setContent(newVal)
  }
})

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

// 组件卸载时销毁编辑器
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
.url-block {
  @apply px-3 py-2 bg-gray-50 rounded border border-gray-200 transition-colors;
}

.url-block.focused {
  @apply border-blue-500 bg-blue-50;
}

.rich-text-editor {
  @apply min-h-[40px] outline-none;
}

.rich-text-editor.focused {
  @apply ring-2 ring-blue-500 rounded;
}

/* 富文本编辑器样式 */
:deep(.ProseMirror) {
  @apply p-0 min-h-[40px] outline-none;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.shortcut-hint {
  @apply text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded;
}
</style>
