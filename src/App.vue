<script setup lang="ts">
import MainSidebar from './components/layout/MainSidebar.vue'
import { computed, onMounted } from 'vue'
import MinimalView from './components/views/MinimalView.vue'
import PreferenceModal from './components/settings/PreferenceModal.vue'
import { usePreferenceStore } from './stores/preferenceStore'
import { PanelLeftOpen, PanelLeftClose } from 'lucide-vue-next'

const prefStore = usePreferenceStore()
const appStyle = computed(() => {
  if (prefStore.activeImage) {
    return {
      backgroundImage: `url(${prefStore.activeImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return {}
})

onMounted(async () => {
  await prefStore.loadPreferences()
})
</script>

<template>
  <div
  <div 
    class="relative flex h-screen w-full font-sans transition-colors duration-300 bg-theme-bg text-theme-text"
    :style="appStyle"
  >
    <div 
      v-if="prefStore.isTransparent && prefStore.activeImage" 
      class="absolute inset-0 backdrop-blur-md z-0"
    ></div>

    <MainSidebar 
      class="relative z-10 h-screen bg-theme-fg transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden"
      :class="prefStore.isSidebarOpen ? 'w-64 border-r border-theme-border' : 'w-0 border-r-0'"
    />
    
    <main class="relative z-10 flex-1 overflow-y-auto">
      <button 
        @click="prefStore.toggleSidebar"
        class="absolute top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-theme-border bg-theme-fg/80 text-theme-text backdrop-blur-md shadow-sm transition-all hover:text-theme-text-hover hover:bg-theme-fg focus:outline-none"
        :title="prefStore.isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
      >
        <PanelLeftClose v-if="prefStore.isSidebarOpen" class="h-4 w-4" />
        <PanelLeftOpen v-else class="h-4 w-4" />
      </button>
      <MinimalView />
    </main>

    <PreferenceModal />
  </div>
</template>

<script setup></script>

<style scoped>
#app {
  width: 300px;
  padding: 1rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
</style>
