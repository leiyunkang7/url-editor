<template>
  <div class="rich-url-editor">
    <!-- 编辑器容器 -->
    <div
      ref="editorContainerRef"
      class="editor-container"
      :class="{
        'border-red-300': !isValid && url.length > 0,
        'border-blue-300': isFocused && isValid,
        'border-gray-300': !isFocused,
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousemove="handleMouseMove"
    >
      <editor-content :editor="editor" class="editor-content" />
    </div>

    <!-- 验证状态显示 -->
    <div v-if="url.length > 0" class="validation-status mt-2">
      <div
        v-if="!isValid"
        class="flex items-center space-x-2 text-red-600 text-sm"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ validationError || 'URL格式无效' }}</span>
      </div>
      <div
        v-else
        class="flex items-center space-x-2 text-green-600 text-sm"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>URL格式有效</span>
      </div>
    </div>

    <!-- 悬停提示 -->
    <HoverTooltip
      :visible="tooltipVisible"
      :part-type="tooltipPartType"
      :part-value="tooltipPartValue"
      :x="tooltipX"
      :y="tooltipY"
    />

    <!-- 自动补全菜单 -->
    <AutoCompleteMenu
      :visible="autocompleteVisible"
      :suggestions="suggestions"
      :x="autocompleteX"
      :y="autocompleteY"
      @select="handleSuggestionSelect"
      @close="autocompleteVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { URLParser } from '@url-editor/core'
import { URLHighlight } from '../extensions/url-highlight'
import { URLClickable, type URLClickableOptions } from '../extensions/url-clickable'
import { URLPartType } from '../extensions/url-highlight'
import { urlToHTML, htmlToURL, parseURLParts } from '../utils/url-to-html'
import HoverTooltip from './HoverTooltip.vue'
import AutoCompleteMenu, { type Suggestion } from './AutoCompleteMenu.vue'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorContainerRef = ref<HTMLElement | null>(null)
const isFocused = ref(false)
const url = ref(props.modelValue || 'https://www.example.com')
const isValid = ref(true)
const validationError = ref<string>('')

// 悬停提示状态
const tooltipVisible = ref(false)
const tooltipPartType = ref<URLPartType | null>(null)
const tooltipPartValue = ref<string>('')
const tooltipX = ref(0)
const tooltipY = ref(0)

// 自动补全状态
const autocompleteVisible = ref(false)
const suggestions = ref<Suggestion[]>([])
const autocompleteX = ref(0)
const autocompleteY = ref(0)
const currentCursorPosition = ref(0)

// 创建编辑器
const clickableOptions: URLClickableOptions = {
  onPartClick: (partType, start, end) => {
    console.log('Part clicked:', partType, start, end)
  },
  onPartDoubleClick: (partType, start, end) => {
    console.log('Part double clicked:', partType, start, end)
  },
}

const editor = useEditor({
  content: urlToHTML(url.value),
  extensions: [
    StarterKit.configure({
      // 禁用一些不需要的功能
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      hardBreak: false,
    }),
    Placeholder.configure({
      placeholder: '输入URL...例如: https://www.example.com/path?param=value#anchor',
    }),
    URLHighlight,
    URLClickable.configure(clickableOptions),
  ],
  onUpdate: ({ editor }) => {
    const text = htmlToURL(editor.getHTML())
    if (text !== url.value) {
      url.value = text
      emit('update:modelValue', text)
      validateURL(text)
      // 延迟更新高亮，避免频繁更新
      nextTick(() => {
        updateHighlighting()
      })
    }
  },
  onFocus: () => {
    isFocused.value = true
  },
  onBlur: () => {
    isFocused.value = false
    tooltipVisible.value = false
    autocompleteVisible.value = false
  },
  onSelectionUpdate: ({ editor }) => {
    const { from } = editor.state.selection
    currentCursorPosition.value = from
  },
  autofocus: false,
  editable: true,
})

// 验证URL
const validateURL = (urlToValidate: string) => {
  if (!urlToValidate.trim()) {
    isValid.value = true
    validationError.value = ''
    return
  }

  try {
    const normalized = urlToValidate.startsWith('http')
      ? urlToValidate
      : `http://${urlToValidate}`
    new URL(normalized)
    isValid.value = true
    validationError.value = ''
  } catch (error) {
    isValid.value = false
    validationError.value =
      error instanceof Error ? error.message : 'URL格式错误'
  }
}

// 更新高亮
let isUpdating = false
const updateHighlighting = async () => {
  if (!editor.value || isUpdating) return

  try {
    isUpdating = true
    const currentHTML = editor.value.getHTML()
    const currentText = htmlToURL(currentHTML)
    
    // 如果URL为空或无效，不更新高亮
    if (!currentText.trim()) {
      isUpdating = false
      return
    }

    const newHTML = urlToHTML(currentText)

    // 只有在HTML不同时才更新，避免循环更新
    if (currentHTML.trim() !== newHTML.trim()) {
      const { from } = editor.value.state.selection
      editor.value.commands.setContent(newHTML, false)
      // 恢复光标位置
      await nextTick()
      if (editor.value) {
        const docSize = editor.value.state.doc.content.size
        const newPos = Math.min(from, Math.max(0, docSize - 1))
        editor.value.commands.setTextSelection(newPos)
      }
    }
  } finally {
    isUpdating = false
  }
}

// 鼠标悬停处理
let hoverTimeout: number | null = null
const handleMouseEnter = () => {
  // 延迟显示提示，避免鼠标移动时频繁显示
}

const handleMouseLeave = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  tooltipVisible.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (!editor.value || !editorContainerRef.value) return

  const containerRect = editorContainerRef.value.getBoundingClientRect()
  const x = event.clientX - containerRect.left
  const y = event.clientY - containerRect.top

  // 根据鼠标位置查找对应的URL部分
  const text = url.value
  const parts = parseURLParts(text)
  const relativeX = event.clientX - containerRect.left

  // 简化处理：根据鼠标X位置估算字符位置
  // 实际应该通过DOM坐标精确计算
  const charWidth = 8 // 估算字符宽度
  const estimatedPos = Math.floor(relativeX / charWidth)

  let currentPart: typeof parts[0] | null = null
  for (const part of parts) {
    if (estimatedPos >= part.start && estimatedPos < part.end) {
      currentPart = part
      break
    }
  }

  if (currentPart && currentPart.type !== 'separator') {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }

    hoverTimeout = window.setTimeout(() => {
      tooltipPartType.value = currentPart!.type
      tooltipPartValue.value = currentPart!.value
      tooltipX.value = event.clientX
      tooltipY.value = event.clientY
      tooltipVisible.value = true
    }, 300)
  } else {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    tooltipVisible.value = false
  }
}

// 自动补全
const getSuggestions = (): Suggestion[] => {
  const text = url.value
  const parts = parseURLParts(text)
  const cursorPos = currentCursorPosition.value

  // 查找光标所在的URL部分
  let currentPart: typeof parts[0] | null = null
  for (const part of parts) {
    if (cursorPos >= part.start && cursorPos < part.end) {
      currentPart = part
      break
    }
  }

  if (!currentPart) return []

  const suggestionsList: Suggestion[] = []

  switch (currentPart.type) {
    case 'protocol':
      suggestionsList.push(
        { label: 'http://', value: 'http://', description: 'HTTP协议' },
        { label: 'https://', value: 'https://', description: 'HTTPS协议' },
        { label: 'ftp://', value: 'ftp://', description: 'FTP协议' }
      )
      break
    case 'domain':
      const domain = currentPart.value
      if (!domain.includes('.')) {
        suggestionsList.push(
          { label: `${domain}.com`, value: `${domain}.com` },
          { label: `${domain}.org`, value: `${domain}.org` },
          { label: `${domain}.net`, value: `${domain}.net` },
          { label: `${domain}.io`, value: `${domain}.io` }
        )
      }
      break
    case 'path':
      suggestionsList.push(
        { label: '/api/', value: '/api/', description: 'API路径' },
        { label: '/v1/', value: '/v1/', description: '版本路径' },
        { label: '/users', value: '/users', description: '用户路径' }
      )
      break
  }

  return suggestionsList
}

const handleSuggestionSelect = (suggestion: Suggestion) => {
  if (!editor.value) return

  const currentText = htmlToURL(editor.value.getHTML())
  const parts = parseURLParts(currentText)
  const cursorPos = currentCursorPosition.value

  // 查找光标所在的URL部分并替换
  for (const part of parts) {
    if (cursorPos >= part.start && cursorPos < part.end) {
      const newText =
        currentText.slice(0, part.start) +
        suggestion.value +
        currentText.slice(part.end)
      url.value = newText
      emit('update:modelValue', newText)
      const newHTML = urlToHTML(newText)
      editor.value.commands.setContent(newHTML)
      updateHighlighting()
      validateURL(newText)
      break
    }
  }

  autocompleteVisible.value = false
}

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  if (!editor.value) return

  // Ctrl+Space: 触发自动补全
  if (event.ctrlKey && event.key === ' ') {
    event.preventDefault()
    const newSuggestions = getSuggestions()
    if (newSuggestions.length > 0) {
      suggestions.value = newSuggestions
      if (editorContainerRef.value) {
        const rect = editorContainerRef.value.getBoundingClientRect()
        autocompleteX.value = rect.left
        autocompleteY.value = rect.bottom + 5
      }
      autocompleteVisible.value = true
    }
  }

  // Ctrl+Shift+H: 切换协议
  if (event.ctrlKey && event.shiftKey && event.key === 'H') {
    event.preventDefault()
    const currentText = htmlToURL(editor.value.getHTML())
    if (currentText.startsWith('http://')) {
      url.value = currentText.replace('http://', 'https://')
    } else if (currentText.startsWith('https://')) {
      url.value = currentText.replace('https://', 'http://')
    } else {
      url.value = `https://${currentText}`
    }
    emit('update:modelValue', url.value)
    editor.value.commands.setContent(urlToHTML(url.value))
    updateHighlighting()
    validateURL(url.value)
  }

  // Esc: 关闭自动补全和提示
  if (event.key === 'Escape') {
    autocompleteVisible.value = false
    tooltipVisible.value = false
  }
}

// 监听外部URL变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== url.value && editor.value) {
      url.value = newValue
      editor.value.commands.setContent(urlToHTML(newValue))
      updateHighlighting()
      validateURL(newValue)
    }
  }
)

// 初始化验证
watch(
  () => url.value,
  (newUrl) => {
    validateURL(newUrl)
  },
  { immediate: true }
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  if (editor.value && url.value) {
    // 初始化时设置内容和应用高亮
    editor.value.commands.setContent(urlToHTML(url.value))
    nextTick(() => {
      updateHighlighting()
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
.rich-url-editor {
  @apply w-full;
}

.editor-container {
  @apply border-2 rounded-lg p-4 transition-colors bg-white min-h-[60px];
}

.editor-content {
  @apply outline-none;
}

:deep(.ProseMirror) {
  @apply outline-none;
  @apply min-h-[40px];
}

:deep(.ProseMirror p) {
  @apply m-0;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  @apply text-gray-400;
  @apply float-left;
  @apply h-0;
  @apply pointer-events-none;
  @apply content-[attr(data-placeholder)];
}

:deep(.url-part-clickable) {
  @apply transition-all duration-150;
}

:deep(.url-part-clickable:hover) {
  @apply underline;
}
</style>
