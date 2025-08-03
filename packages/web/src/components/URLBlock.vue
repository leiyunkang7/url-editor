<template>
  <div 
    class="url-block"
    :class="{ 'focused': is-focused }"
    @click="$emit('focus')"
  >
    <div class="flex items-center space-x-2">
      <span class="text-xs text-gray-500 uppercase">{{ block.type }}</span>
      <input
        :value="block.value"
        @input="handleInput"
        @focus="$emit('focus')"
        class="flex-1 bg-transparent border-none outline-none text-sm"
        :placeholder="getPlaceholder()"
      />
      <div class="shortcut-hint">{{ getShortcutHint() }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { URLBlock as URLBlockType } from '@url-editor/core'

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

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update', props.block.type, target.value)
}

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
</script> 