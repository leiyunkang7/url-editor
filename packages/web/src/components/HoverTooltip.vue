<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && content"
        ref="tooltipRef"
        class="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none"
        :style="tooltipStyle"
      >
        <div class="whitespace-nowrap">{{ content }}</div>
        <div
          v-if="details"
          class="mt-1 text-xs text-gray-300 whitespace-normal max-w-xs"
        >
          {{ details }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { URLPartType } from '../extensions/url-highlight'

interface Props {
  visible: boolean
  partType: URLPartType | null
  partValue?: string
  x: number
  y: number
}

const props = defineProps<Props>()

const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = computed(() => {
  if (!tooltipRef.value) {
    return {
      left: `${props.x}px`,
      top: `${props.y - 10}px`,
      transform: 'translateY(-100%)',
    }
  }

  const rect = tooltipRef.value.getBoundingClientRect()
  let left = props.x
  let top = props.y - 10
  let transform = 'translateY(-100%)'

  // 防止超出屏幕右侧
  if (left + rect.width > window.innerWidth) {
    left = window.innerWidth - rect.width - 10
  }

  // 防止超出屏幕左侧
  if (left < 0) {
    left = 10
  }

  // 如果上方空间不足，显示在下方
  if (top - rect.height < 0) {
    top = props.y + 10
    transform = 'translateY(0)'
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform,
  }
})

const content = computed(() => {
  if (!props.partType) return ''
  
  const tooltips: Record<URLPartType, string> = {
    protocol: '点击切换 http/https',
    domain: '域名',
    port: '端口号',
    path: '路径',
    query: '查询参数',
    fragment: '锚点',
    separator: '',
  }
  
  return tooltips[props.partType] || ''
})

const details = computed(() => {
  if (!props.partType || !props.partValue) return ''
  
  switch (props.partType) {
    case 'protocol':
      return `当前协议: ${props.partValue}`
    case 'domain':
      return `域名: ${props.partValue}`
    case 'port':
      return `端口: ${props.partValue} (常用: 80, 443, 3000, 8080)`
    case 'path':
      return `路径: ${props.partValue}`
    case 'query':
      try {
        const params = new URLSearchParams(props.partValue)
        const paramList = Array.from(params.entries())
          .map(([key, value]) => `${key}=${value}`)
          .join(', ')
        return `参数: ${paramList || '无'}`
      } catch {
        return `参数: ${props.partValue}`
      }
    case 'fragment':
      return `锚点: ${props.partValue}`
    default:
      return ''
  }
})
</script>

<style scoped>
/* 工具提示箭头样式 */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}
</style>
