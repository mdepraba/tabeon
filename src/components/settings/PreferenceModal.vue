<script setup lang="ts">
import { X, Sun, Moon, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-vue-next'
import { usePreferenceStore } from '../../stores/preferenceStore'

const prefStore = usePreferenceStore()

const handleImageUpload = (event: Event, index: number) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  prefStore.uploadImageToSlot(index, file)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="prefStore.isSettingOpen" class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      <div
        class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        @click="prefStore.toggleSetting"></div>

      <div
        class="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-theme-bg/80 p-8 shadow-2xl backdrop-blur-2xl scrollbar-hide">
        <div class="mb-8 flex items-center justify-between">
          <h2 class="text-2xl font-semibold tracking-tight text-theme-text-hover">Settings</h2>
          <button
            @click="prefStore.toggleSetting"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-theme-fg/60 text-theme-text transition-colors hover:bg-theme-text/10 hover:text-theme-text-hover">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-8">
          <section>
            <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-theme-text/50">General</h3>
            <div class="overflow-hidden rounded-2xl bg-theme-fg/40 shadow-sm border border-theme-text">
              <div class="flex items-center justify-between p-4">
                <div>
                  <p class="font-medium text-theme-text-hover">Start-up View</p>
                  <p class="text-sm text-theme-text/70">What to show on new tab</p>
                </div>
                <div class="flex rounded-xl bg-theme-text/5 p-1">
                  <button
                    @click="prefStore.startupView = 'minimal'"
                    :class="
                      prefStore.startupView === 'minimal'
                        ? 'bg-theme-bg text-theme-text-hover shadow-sm'
                        : 'text-theme-text hover:text-theme-text-hover'
                    "
                    class="px-4 py-1.5 text-sm font-medium rounded-lg transition-all">
                    Minimal
                  </button>
                  <button
                    @click="prefStore.startupView = 'zones'"
                    :class="
                      prefStore.startupView === 'zones'
                        ? 'bg-theme-bg text-theme-text-hover shadow-sm'
                        : 'text-theme-text hover:text-theme-text-hover'
                    "
                    class="px-4 py-1.5 text-sm font-medium rounded-lg transition-all">
                    Zones
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-theme-text/50">Appearance</h3>
            <div class="overflow-hidden rounded-2xl bg-theme-fg/40 shadow-sm border border-theme-text">
              <div class="flex items-center justify-between border-b border-theme-text p-4">
                <div>
                  <p class="font-medium text-theme-text-hover">Color Theme</p>
                  <p class="text-sm text-theme-text/70">Interface color mode</p>
                </div>
                <div class="flex rounded-xl bg-theme-text/5 p-1">
                  <button
                    @click="prefStore.themeMode = 'light'"
                    :class="
                      prefStore.themeMode === 'light'
                        ? 'bg-theme-bg text-theme-highlight shadow-sm'
                        : 'text-theme-text hover:text-theme-text-hover'
                    "
                    class="p-2 rounded-lg transition-all">
                    <Sun class="h-4 w-4" />
                  </button>
                  <button
                    @click="prefStore.themeMode = 'dark'"
                    :class="
                      prefStore.themeMode === 'dark'
                        ? 'bg-theme-bg text-theme-highlight shadow-sm'
                        : 'text-theme-text hover:text-theme-text-hover'
                    "
                    class="p-2 rounded-lg transition-all">
                    <Moon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between p-4">
                <div>
                  <p class="font-medium text-theme-text-hover">Glassmorphism</p>
                  <p class="text-sm text-theme-text/70">Enable transparent background</p>
                </div>
                <button
                  @click="prefStore.isTransparent = !prefStore.isTransparent"
                  :class="prefStore.isTransparent ? 'bg-theme-highlight' : 'bg-theme-text/20'"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span
                    :class="prefStore.isTransparent ? 'translate-x-5 bg-white ' : 'translate-x-0 bg-black'"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>
            </div>
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-widest text-theme-text/50">Backgrounds</h3>
            </div>

            <div class="rounded-2xl bg-theme-fg/40 p-4 border border-theme-text">
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="(_, index) in 3"
                  :key="index"
                  class="group relative aspect-video overflow-hidden rounded-xl border-2 transition-all"
                  :class="
                    prefStore.activeImageIndex === index
                      ? 'border-theme-highlight shadow-md'
                      : 'border-transparent bg-theme-text/5 hover:bg-theme-text/10'
                  ">
                  <template v-if="prefStore.savedImages[index]">
                    <img
                      :src="prefStore.savedImages[index] as string"
                      @click="prefStore.activeImageIndex = index"
                      class="h-full w-full cursor-pointer object-cover" />

                    <div
                      v-if="prefStore.activeImageIndex === index"
                      class="absolute left-2 top-2 rounded-full bg-theme-highlight text-white shadow-sm">
                      <CheckCircle2 class="h-4 w-4" />
                    </div>

                    <button
                      @click="prefStore.removeImageFromSlot(index)"
                      class="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500 group-hover:opacity-100">
                      <Trash2 class="h-3 w-3" />
                    </button>
                  </template>

                  <label
                    v-else
                    class="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-theme-text/50 transition-colors hover:text-theme-text">
                    <ImageIcon class="h-5 w-5" />
                    <span class="text-[10px] font-semibold tracking-wider">UPLOAD</span>
                    <input type="file" accept="image/*" class="hidden" @change="e => handleImageUpload(e, index)" />
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transisi mulus untuk modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Menyembunyikan scrollbar bawaan browser agar terlihat lebih 'Mac' */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
