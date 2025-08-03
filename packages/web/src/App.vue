<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">URL Editor</h1>
        <p class="text-gray-600">支持键盘快捷操作的URL编辑器</p>
      </header>
      
      <main>
        <URLEditor />
      </main>
      
      <footer class="mt-8 text-center text-gray-500">
        <p>使用 Tab 键在区块间跳转，Space 键切换协议</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import URLEditor from './components/URLEditor.vue'
</script> 