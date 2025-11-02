<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-[-10px]"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-[-10px]"
    >
      <div
        v-if="visible && suggestions.length > 0"
        ref="menuRef"
        class="fixed z-50 mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg"
        :style="menuStyle"
      >
        <ul class="py-1">
          <li
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="px-4 py-2 cursor-pointer transition-colors"
            :class="{
              'bg-blue-50 text-blue-600': index === selectedIndex,
              'hover:bg-gray-50': index !== selectedIndex,
            }"
            @click="selectSuggestion(suggestion)"
            @mouseenter="selectedIndex = index"
          >
            <div class="flex items-center space-x-2">
              <span class="font-medium">{{ suggestion.label }}</span>
              <span v-if="suggestion.description" class="text-xs text-gray-500">
                {{ suggestion.description }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { URLPartType } from '../extensions/url-highlight'

export interface Suggestion {
  label: string
  value: string
  description?: string
  partType?: URLPartType
}

interface Props {
  visible: boolean
  suggestions: Suggestion[]
  x: number
  y: number
}

interface Emits {
  (e: 'select', suggestion: Suggestion): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const menuRef = ref<HTMLElement | null>(null)
const selectedIndex = ref(0)

const menuStyle = computed(() => {
  if (!menuRef.value) {
    return {
      left: `${props.x}px`,
      top: `${props.y}px`,
      minWidth: '200px',
    }
  }

  const rect = menuRef.value.getBoundingClientRect()
  let left = props.x
  let top = props.y

  // 防止超出屏幕右侧
  if (left + rect.width > window.innerWidth) {
    left = window.innerWidth - rect.width - 10
  }

  // 防止超出屏幕左侧
  if (left < 0) {
    left = 10
  }

  // 如果下方空间不足，显示在上方
  if (top + rect.height > window.innerHeight) {
    top = props.y - rect.height - 5
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    minWidth: '200px',
  }
})

watch(() => props.suggestions, () => {
  selectedIndex.value = 0
})

const selectSuggestion = (suggestion: Suggestion) => {
  emit('select', suggestion)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.visible || props.suggestions.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % props.suggestions.length
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value =
        selectedIndex.value === 0
          ? props.suggestions.length - 1
          : selectedIndex.value - 1
      break
    case 'Enter':
      event.preventDefault()
      if (props.suggestions[selectedIndex.value]) {
        selectSuggestion(props.suggestions[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
